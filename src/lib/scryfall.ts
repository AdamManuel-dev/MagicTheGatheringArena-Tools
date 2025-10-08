/**
 * @fileoverview Scryfall API integration for MTG card name resolution
 *
 * Features: Per-card lookups by arena_id, bulk dataset loading for batch resolution
 * Main APIs: getCardByArenaId(), loadBulkMap()
 * Constraints: Respects Scryfall API rate limits, handles gzip compression
 * Patterns: Returns ScryfallCardLite with minimal fields, null on errors
 */

import https from 'https';
import zlib from 'zlib';

export type ScryfallCardLite = {
  name: string;
  set?: string;
  collector_number?: string;
  rarity?: string;
};

function httpsGetJSON<T = unknown>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
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

export async function loadBulkMap(): Promise<Map<number, ScryfallCardLite>> {
  // Bulk endpoint → find "default_cards", then build arena_id → lite map
  // https://scryfall.com/docs/api/cards (arena_id field)
  type BulkMetaEntry = {
    type?: string;
    download_uri?: string;
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

  const meta = await httpsGetJSON<BulkMeta>('https://api.scryfall.com/bulk-data');
  const entries = Array.isArray(meta.data) ? meta.data : [];
  const def = entries.find((entry) => entry.type === 'default_cards');
  if (!def || typeof def.download_uri !== 'string') {
    throw new Error('Scryfall bulk default_cards not found');
  }
  const cards = await httpsGetJSON<Array<BulkCardEntry>>(def.download_uri);
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
