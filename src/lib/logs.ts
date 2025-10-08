/**
 * @fileoverview MTG Arena log ingestion service and collection helpers.
 *
 * Features: Snapshot reading with rotation handling, cached fallbacks, live streaming, collection parsing
 * Main APIs: LogIngestionService.readLatest(), LogIngestionService.streamLive(), extractOwnedFromLog()
 * Constraints: macOS Player.log locations, requires Detailed Logs enabled
 * Patterns: Provides retry/backoff for file locks, snapshot persistence, and legacy helper wrappers
 */

import fs from 'fs';
import {promises as fsp} from 'fs';
import os from 'os';
import path from 'path';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const defaultLogDir = path.join(
  os.homedir(),
  'Library',
  'Logs',
  'Wizards Of The Coast',
  'MTGA',
);

export const defaultLogs: Array<string> = [
  path.join(defaultLogDir, 'Player.log'),
  path.join(defaultLogDir, 'Player-prev.log'),
];

const CACHE_ROOT = path.join(process.cwd(), 'cache', 'logs');
const SNAPSHOT_DIR = path.join(CACHE_ROOT, 'snapshots');
const LATEST_META_FILE = path.join(CACHE_ROOT, 'latest.json');

const RETRY_DELAYS_MS = [250, 500, 1000, 2000, 4000];
const MAX_SNAPSHOTS = 5;

function ensureCacheDirs(): void {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, {recursive: true});
  }
}

function sanitizeTimestamp(ts: string): string {
  return ts.replace(/[:.]/g, '-');
}

type SnapshotMetaFile = {
  timestamp: string;
  logFile: string;
  combinedPaths: Array<string>;
  bytes: number;
};

export type LogSnapshot = {
  primaryPath: string;
  combinedPaths: Array<string>;
  text: string;
  bytes: number;
  mtimes: Record<string, string | null>;
  fromCache: boolean;
};

export type LogStreamPayload = {
  path: string;
  data: string;
  offset: number;
  size: number;
};

export type LogStreamOptions = {
  customPath?: string;
  pollIntervalMs?: number;
  startAtEnd?: boolean;
  signal?: AbortSignal;
};

export class LogIngestionService {
  private readonly cacheDir: string;
  private lastSnapshot: LogSnapshot | null = null;

  constructor(private readonly options: {logDir?: string; retryDelaysMs?: Array<number>} = {}) {
    this.cacheDir = CACHE_ROOT;
    ensureCacheDirs();
  }

  private get retryDelays(): Array<number> {
    return this.options.retryDelaysMs ?? RETRY_DELAYS_MS;
  }

  private getCandidatePaths(custom?: string): Array<string> {
    if (custom) return [custom];
    if (this.options.logDir) {
      return [path.join(this.options.logDir, 'Player.log'), path.join(this.options.logDir, 'player-prev.log')];
    }
    return [...defaultLogs];
  }

  private async readFileSafe(p: string): Promise<{text: string; mtime: Date | null}> {
    try {
      const stats = await fsp.stat(p);
      let attempt = 0;
      while (true) {
        try {
          const text = await fsp.readFile(p, 'utf8');
          return {text, mtime: stats.mtime};
        } catch (error) {
          const code = (error as NodeJS.ErrnoException)?.code;
          const retryable = code === 'EBUSY' || code === 'EPERM';
          if (!retryable || attempt >= this.retryDelays.length) throw error;
          await sleep(this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)]);
          attempt++;
        }
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException)?.code;
      if (code === 'ENOENT') return {text: '', mtime: null};
      throw error;
    }
  }

  private persistSnapshot(snapshot: LogSnapshot): void {
    const timestamp = sanitizeTimestamp(new Date().toISOString());
    const logFile = path.join(SNAPSHOT_DIR, `snapshot-${timestamp}.log`);
    fs.writeFileSync(logFile, snapshot.text, 'utf8');
    const meta: SnapshotMetaFile = {
      timestamp,
      logFile,
      combinedPaths: snapshot.combinedPaths,
      bytes: snapshot.bytes,
    };
    fs.writeFileSync(LATEST_META_FILE, JSON.stringify(meta, null, 2), 'utf8');
    this.lastSnapshot = snapshot;
    this.pruneSnapshots();
  }

  private pruneSnapshots(): void {
    const entries = fs.readdirSync(SNAPSHOT_DIR).filter((name) => name.startsWith('snapshot-'));
    entries.sort();
    while (entries.length > MAX_SNAPSHOTS) {
      const oldest = entries.shift();
      if (!oldest) break;
      const filePath = path.join(SNAPSHOT_DIR, oldest);
      try {
        fs.unlinkSync(filePath);
      } catch {
        /* ignore */
      }
      const metaFile = oldest.replace(/\.log$/, '.json');
      if (metaFile !== oldest && fs.existsSync(path.join(SNAPSHOT_DIR, metaFile))) {
        try {
          fs.unlinkSync(path.join(SNAPSHOT_DIR, metaFile));
        } catch {
          /* ignore */
        }
      }
    }
  }

  private loadCachedSnapshot(): LogSnapshot | null {
    if (this.lastSnapshot) return this.lastSnapshot;
    try {
      const metaRaw = fs.readFileSync(LATEST_META_FILE, 'utf8');
      const meta = JSON.parse(metaRaw) as SnapshotMetaFile;
      const text = fs.readFileSync(meta.logFile, 'utf8');
      return {
        primaryPath: meta.combinedPaths[0] ?? '',
        combinedPaths: meta.combinedPaths,
        text,
        bytes: meta.bytes,
        mtimes: {},
        fromCache: true,
      };
    } catch {
      return null;
    }
  }

  async readLatest(customPath?: string): Promise<LogSnapshot> {
    const candidates = this.getCandidatePaths(customPath);
    const pieces = [] as Array<{path: string; text: string; mtime: Date | null}>;

    for (const candidate of candidates) {
      const result = await this.readFileSafe(candidate);
      if (result.text) pieces.push({path: candidate, text: result.text, mtime: result.mtime});
    }

    if (pieces.length === 0) {
      const cached = this.loadCachedSnapshot();
      if (cached) return cached;
      return {
        primaryPath: candidates[0] ?? '',
        combinedPaths: [],
        text: '',
        bytes: 0,
        mtimes: {},
        fromCache: false,
      };
    }

    const primaryPiece = pieces.reduce((best, current) =>
      current.text.length > best.text.length ? current : best,
    pieces[0]);

    const orderedPieces = [primaryPiece, ...pieces.filter((piece) => piece.path !== primaryPiece.path)];

    const seen = new Set<string>();
    const combinedParts: Array<string> = [];
    const mtimes: Record<string, string | null> = {};

    for (const piece of orderedPieces) {
      if (!seen.has(piece.path)) {
        combinedParts.push(piece.text);
        seen.add(piece.path);
        mtimes[piece.path] = piece.mtime?.toISOString() ?? null;
      }
    }

    const text = combinedParts.join('\n');
    const snapshot: LogSnapshot = {
      primaryPath: primaryPiece.path,
      combinedPaths: orderedPieces.map((p) => p.path),
      text,
      bytes: Buffer.byteLength(text, 'utf8'),
      mtimes,
      fromCache: false,
    };

    this.persistSnapshot(snapshot);
    return snapshot;
  }

  async *streamLive(options: LogStreamOptions = {}): AsyncGenerator<LogStreamPayload> {
    const {pollIntervalMs = 500, startAtEnd = true, signal, customPath} = options;
    const candidates = this.getCandidatePaths(customPath);
    if (candidates.length === 0) return;

    let primaryPath = candidates[0];
    let offset = 0;
    let initialized = false;

    while (!signal?.aborted) {
      try {
        const stats = await fsp.stat(primaryPath);
        if (!initialized) {
          offset = startAtEnd ? Number(stats.size) : 0;
          initialized = true;
        }
        if (stats.size < offset) {
          // rotation detected
          offset = 0;
        }
        if (stats.size > offset) {
          const handle = await fsp.open(primaryPath, 'r');
          try {
            const length = Number(stats.size - offset);
            const buffer = Buffer.alloc(length);
            await handle.read(buffer, 0, length, offset);
            offset = Number(stats.size);
            yield {
              path: primaryPath,
              data: buffer.toString('utf8'),
              offset,
              size: Number(stats.size),
            };
          } finally {
            await handle.close();
          }
        }
      } catch (error) {
        const code = (error as NodeJS.ErrnoException)?.code;
        if (code === 'ENOENT') {
          // file not yet available, retry after delay
          initialized = false;
        } else if (code === 'EBUSY' || code === 'EPERM') {
          // wait using retry schedule
          for (const delay of this.retryDelays) {
            if (signal?.aborted) return;
            await sleep(delay);
            try {
              await fsp.access(primaryPath, fs.constants.R_OK);
              break;
            } catch {
              continue;
            }
          }
        } else {
          throw error;
        }
      }
      if (signal?.aborted) return;
      await sleep(pollIntervalMs);

      if (!fs.existsSync(primaryPath) && candidates.length > 1) {
        // try fallback path (player-prev) if primary missing
        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            primaryPath = candidate;
            offset = 0;
            initialized = false;
            break;
          }
        }
      }
    }
  }
}

/**
 * Legacy helper returning longest available log. Prefer using LogIngestionService.readLatest().
 */
export async function readBestLog(custom?: string): Promise<{path: string; text: string}> {
  const snapshot = await defaultLogService.readLatest(custom);
  return {path: snapshot.primaryPath, text: snapshot.text};
}

function sliceJSONObject(text: string, startPos: number): string | null {
  const start = text.indexOf('{', startPos);
  if (start === -1) return null;
  let depth = 0;
  let end = -1;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;
  return text.slice(start, end + 1);
}

function collectCardCountsFromObject(root: unknown): Map<number, number> {
  const counts = new Map<number, number>();
  const visit = (node: unknown): void => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach((value) => visit(value));
      return;
    }
    if (typeof node === 'object') {
      const obj = node as Record<string, unknown>;
      if ('cardId' in obj && 'quantity' in obj) {
        const idCandidate = (obj as {cardId?: unknown}).cardId;
        const quantityCandidate = (obj as {quantity?: unknown}).quantity;
        const id = Number(idCandidate);
        const quantity = Number(quantityCandidate);
        if (Number.isInteger(id) && Number.isFinite(quantity)) {
          counts.set(id, Math.max(counts.get(id) ?? 0, quantity));
        }
      }
      for (const value of Object.values(obj)) visit(value);
    }
  };
  visit(root);
  return counts;
}

export function extractOwnedFromLog(logText: string): Map<number, number> {
  const out = new Map<number, number>();

  const prefer = (pos: number) => {
    const json = sliceJSONObject(logText, pos);
    if (!json) return;
    try {
      const parsed = JSON.parse(json);
      const m = collectCardCountsFromObject(parsed);
      for (const [id, q] of m) out.set(id, Math.max(out.get(id) ?? 0, q));
    } catch {
      /* ignore parse errors */
    }
  };

  const invPos = logText.lastIndexOf('InventoryInfo');
  if (invPos !== -1) prefer(invPos);

  const v3pos = logText.lastIndexOf('GetPlayerCardsV3');
  if (v3pos !== -1) prefer(v3pos);

  if (out.size === 0) {
    const re = /"cardId"\s*:\s*(\d+)\s*,\s*"quantity"\s*:\s*(\d+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(logText))) {
      const id = Number(m[1]);
      const q = Number(m[2]);
      out.set(id, Math.max(out.get(id) ?? 0, q));
    }
  }

  return out;
}

export const defaultLogService = new LogIngestionService();
