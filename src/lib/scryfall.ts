/**
 * @fileoverview Scryfall API integration for MTG card name resolution
 *
 * Features: Per-card lookups by arena_id, bulk dataset loading for batch resolution
 * Main APIs: getCardByArenaId(), loadBulkMap()
 * Constraints: Respects Scryfall API rate limits, handles gzip compression
 * Patterns: Returns ScryfallCardLite with minimal fields, null on errors
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import zlib from 'zlib';

const CACHE_ROOT = path.join(process.cwd(), 'cache', 'scryfall');
const BULK_CACHE_FILE = path.join(CACHE_ROOT, 'default_cards.json');
const BULK_META_FILE = path.join(CACHE_ROOT, 'default_cards.meta.json');

type BulkCacheMeta = {
  updated_at: string;
  downloaded_at: string;
  download_uri: string;
};

let inMemoryBulkMap: Map<number, ScryfallCardLite> | null = null;

export type ScryfallCardLite = {
  name: string;
  set?: string;
  collector_number?: string;
  rarity?: string;
};

type BulkCardEntry = {
  arena_id?: number;
  name?: string;
  set?: string;
  collector_number?: string;
  rarity?: string;
};

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_ROOT)) {
    fs.mkdirSync(CACHE_ROOT, {recursive: true});
  }
}

function readCacheMeta(): BulkCacheMeta | null {
  try {
    const raw = fs.readFileSync(BULK_META_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<BulkCacheMeta>;
    if (!parsed.updated_at || !parsed.download_uri) return null;
    return {
      updated_at: parsed.updated_at,
      downloaded_at: parsed.downloaded_at ?? parsed.updated_at,
      download_uri: parsed.download_uri,
    };
  } catch {
    return null;
  }
}

function writeCacheMeta(meta: BulkCacheMeta): void {
  fs.writeFileSync(BULK_META_FILE, JSON.stringify(meta, null, 2), 'utf8');
}

function readCachedBulk(): Array<BulkCardEntry> | null {
  try {
    const raw = fs.readFileSync(BULK_CACHE_FILE, 'utf8');
    return JSON.parse(raw) as Array<BulkCardEntry>;
  } catch {
    return null;
  }
}

function buildMap(cards: Array<BulkCardEntry>): Map<number, ScryfallCardLite> {
  const map = new Map<number, ScryfallCardLite>();
  for (const c of cards) {
    if (typeof c.arena_id === 'number' && typeof c.name === 'string') {
      map.set(c.arena_id, {
        name: c.name,
        set: typeof c.set === 'string' ? c.set.toUpperCase() : undefined,
        collector_number: typeof c.collector_number === 'string' ? c.collector_number : undefined,
        rarity: typeof c.rarity === 'string' ? c.rarity : undefined,
      });
    }
  }
  return map;
}

function loadBulkMapFromCache(): Map<number, ScryfallCardLite> | null {
  const cached = readCachedBulk();
  if (!cached) return null;
  return buildMap(cached);
}

function httpsGetJSON<T = unknown>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'mtga-collection/0.1.0',
        'Accept': 'application/json',
      },
    };
    https
      .get(url, options, (res) => {
        const gz = /gzip/i.test(res.headers['content-encoding'] || '');
        const stream = gz ? res.pipe(zlib.createGunzip()) : res;
        const chunks: Array<Buffer> = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          try {
            const buf = Buffer.concat(chunks).toString('utf8');
            resolve(JSON.parse(buf));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });
}

export async function getCardByArenaId(id: number): Promise<ScryfallCardLite | null> {
  if (inMemoryBulkMap?.has(id)) {
    return inMemoryBulkMap.get(id) ?? null;
  }

  const cachedMap = loadBulkMapFromCache();
  if (cachedMap?.has(id)) {
    inMemoryBulkMap = cachedMap;
    return cachedMap.get(id) ?? null;
  }

  // https://scryfall.com/docs/api/cards/arena/:id
  const url = `https://api.scryfall.com/cards/arena/${id}`;
  try {
    type ArenaCardResponse = {
      name?: string;
      set?: string;
      collector_number?: string;
      rarity?: string;
    };
    const card = await httpsGetJSON<ArenaCardResponse>(url);
    if (typeof card?.name !== 'string') return null;
    return {
      name: card.name,
      set: typeof card.set === 'string' ? card.set.toUpperCase() : undefined,
      collector_number: typeof card.collector_number === 'string' ? card.collector_number : undefined,
      rarity: typeof card.rarity === 'string' ? card.rarity : undefined,
    };
  } catch {
    return null;
  }
}

export async function loadBulkMap(options: {forceRefresh?: boolean} = {}): Promise<Map<number, ScryfallCardLite>> {
  const {forceRefresh = false} = options;
  // Bulk endpoint → find "default_cards", then build arena_id → lite map
  // https://scryfall.com/docs/api/cards (arena_id field)
  ensureCacheDir();

  type BulkMetaEntry = {
    type?: string;
    download_uri?: string;
    updated_at?: string;
  };
  type BulkMeta = {
    data?: Array<BulkMetaEntry>;
  };
  type BulkCardEntry = {
    arena_id?: number;
    name?: string;
    set?: string;
    collector_number?: string;
    rarity?: string;
  };

  let cards: Array<BulkCardEntry> | null = null;
  const cachedMeta = readCacheMeta();

  try {
    const meta = await httpsGetJSON<BulkMeta>('https://api.scryfall.com/bulk-data');
    const entries = Array.isArray(meta.data) ? meta.data : [];
    const def = entries.find((entry) => entry.type === 'default_cards');
    if (!def || typeof def.download_uri !== 'string' || typeof def.updated_at !== 'string') {
      throw new Error('Scryfall bulk default_cards not found');
    }

    const needsRefresh =
      forceRefresh || !cachedMeta || cachedMeta.updated_at !== def.updated_at;

    if (!needsRefresh) {
      cards = readCachedBulk();
    }

    if (!cards) {
      cards = await httpsGetJSON<Array<BulkCardEntry>>(def.download_uri);
      fs.writeFileSync(BULK_CACHE_FILE, JSON.stringify(cards), 'utf8');
      writeCacheMeta({
        updated_at: def.updated_at,
        downloaded_at: new Date().toISOString(),
        download_uri: def.download_uri,
      });
    }
  } catch (error) {
    if (!cards) {
      // Attempt to fall back to cached data if network fetch fails
      cards = readCachedBulk();
      if (!cards) throw error instanceof Error ? error : new Error(String(error));
    }
  }

  if (!cards) throw new Error('Failed to load Scryfall bulk dataset.');
  const map = buildMap(cards);
  inMemoryBulkMap = map;
  return map;
}
