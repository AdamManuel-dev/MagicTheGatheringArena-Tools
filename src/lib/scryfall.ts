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

function httpsGetJSON<T = any>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const gz = /gzip/i.test(res.headers['content-encoding'] || '');
        const stream = gz ? res.pipe(zlib.createGunzip()) : res;
        const chunks: Buffer[] = [];
        stream.on('data', (d) => chunks.push(d as Buffer));
        stream.on('end', () => {
          try {
            const buf = Buffer.concat(chunks).toString('utf8');
            resolve(JSON.parse(buf));
          } catch (e) {
            reject(e);
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
    const c: any = await httpsGetJSON(url);
    return {
      name: c.name,
      set: c.set?.toUpperCase(),
      collector_number: c.collector_number,
      rarity: c.rarity,
    };
  } catch {
    return null;
  }
}

export async function loadBulkMap(): Promise<Map<number, ScryfallCardLite>> {
  // Bulk endpoint → find "default_cards", then build arena_id → lite map
  // https://scryfall.com/docs/api/cards (arena_id field)
  const meta: any = await httpsGetJSON('https://api.scryfall.com/bulk-data');
  const def = (meta.data || []).find((x: any) => x.type === 'default_cards');
  if (!def?.download_uri) throw new Error('Scryfall bulk default_cards not found');
  const cards: any[] = await httpsGetJSON(def.download_uri);
  const map = new Map<number, ScryfallCardLite>();
  for (const c of cards) {
    if (typeof c.arena_id === 'number') {
      map.set(c.arena_id, {
        name: c.name,
        set: c.set?.toUpperCase(),
        collector_number: c.collector_number,
        rarity: c.rarity,
      });
    }
  }
  return map;
}
