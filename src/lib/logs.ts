/**
 * @fileoverview MTG Arena log file parser for extracting collection data
 *
 * Features: Parses Player.log files, extracts card ownership data, handles multiple log formats
 * Main APIs: extractOwnedFromLog(), readBestLog()
 * Constraints: Requires detailed logging enabled in MTGA, macOS-specific paths
 * Patterns: Handles InventoryInfo and GetPlayerCardsV3 formats with regex fallback
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

export const defaultLogDir = path.join(
  os.homedir(),
  'Library',
  'Logs',
  'Wizards Of The Coast',
  'MTGA',
);

export const defaultLogs: Array<string> = [
  path.join(defaultLogDir, 'Player.log'),
  path.join(defaultLogDir, 'player-prev.log'),
];

export function readText(p: string): string {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
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

  // Newer sessions: InventoryInfo blob
  const invPos = logText.lastIndexOf('InventoryInfo');
  if (invPos !== -1) prefer(invPos);

  // Older calls
  const v3pos = logText.lastIndexOf('GetPlayerCardsV3');
  if (v3pos !== -1) prefer(v3pos);

  // Regex fallback
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

export function readBestLog(custom?: string): {path: string; text: string} {
  const candidates = custom ? [custom] : defaultLogs;
  let best = {path: '', text: ''};
  for (const p of candidates) {
    const t = readText(p);
    if (t.length > best.text.length) best = {path: p, text: t};
  }
  return best;
}
