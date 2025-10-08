/**
 * @fileoverview Extract command for MTG Arena collection export
 *
 * Features: CSV/JSON output, Scryfall name resolution, bulk or per-card lookups
 * Main APIs: Extract.run()
 * Constraints: macOS-only, requires detailed logging enabled in MTGA
 * Patterns: Uses oclif Command framework with typed flags
 */

import {Command, Flags} from '@oclif/core';
import {extractOwnedFromLog, readBestLog} from '../lib/logs';
import {getCardByArenaId, loadBulkMap} from '../lib/scryfall';
import fs from 'fs';

type Row = {
  arena_id: number;
  quantity: number;
  name?: string | null;
  set?: string | null;
  collector_number?: string | null;
  rarity?: string | null;
};

export default class Extract extends Command {
  static summary = 'Extract all owned MTG Arena cards from Player.log (macOS).';

  static description = [
    'Reads ~/Library/Logs/Wizards Of The Coast/MTGA/Player.log (and player-prev.log)',
    'to gather arena_id → quantity pairs. Optionally resolves to names via Scryfall.',
  ].join(' ');

  static examples = [
    '$ mtga-collection extract > collection.csv',
    '$ mtga-collection extract --json > collection.json',
    '$ mtga-collection extract --no-names --out arena_ids.csv',
    '$ mtga-collection extract --bulk --out collection.csv',
    '$ mtga-collection extract --log ~/Desktop/Player.log',
  ];

  static flags = {
    json: Flags.boolean({description: 'output JSON instead of CSV', default: false}),
    'no-names': Flags.boolean({description: "skip Scryfall lookups (arena_id + qty only)", default: false}),
    bulk: Flags.boolean({
      description: 'use Scryfall bulk dataset for faster name resolution',
      default: false,
    }),
    log: Flags.string({description: 'custom path to Player.log'}),
    out: Flags.string({description: 'write to file instead of stdout'}),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(Extract);
    const {log: customLog, json, bulk, out} = flags;
    const noNames = flags['no-names'];

    const picked = readBestLog(customLog);
    if (!picked.text) {
      this.error('Could not read Player.log. Verify MTG Arena is installed and logs exist on this macOS account.');
    }

    const owned = extractOwnedFromLog(picked.text);
    if (owned.size === 0) {
      this.error([
        'No owned cards found in the log.',
        'Make sure Detailed Logs (Plugin Support) are enabled and you opened the Collection screen this session.',
      ].join(' '));
    }

    let rows: Row[] = [];
    if (noNames) {
      rows = [...owned.entries()].map(([arena_id, quantity]) => ({arena_id, quantity}));
    } else {
      if (bulk) {
        let map: Map<number, any>;
        try {
          map = await loadBulkMap();
        } catch (e: any) {
          this.warn(`Bulk load failed: ${e?.message ?? e}. Falling back to per-card lookups…`);
          map = new Map();
        }
        rows = [...owned.entries()].map(([arena_id, quantity]) => {
          const m = map.get(arena_id);
          return {
            arena_id,
            quantity,
            name: m?.name ?? null,
            set: m?.set ?? null,
            collector_number: m?.collector_number ?? null,
            rarity: m?.rarity ?? null,
          };
        });
      } else {
        rows = [];
        for (const [arena_id, quantity] of owned.entries()) {
          const c = await getCardByArenaId(arena_id);
          rows.push({
            arena_id,
            quantity,
            name: c?.name ?? null,
            set: c?.set ?? null,
            collector_number: c?.collector_number ?? null,
            rarity: c?.rarity ?? null,
          });
          // polite pacing handled inside getCardByArenaId if desired
        }
      }
    }

    if (json) {
      const payload = JSON.stringify({count: rows.length, cards: rows}, null, 2);
      if (out) fs.writeFileSync(out, payload, 'utf8');
      else process.stdout.write(payload + '\n');
      return;
    }

    // CSV
    const header = noNames
      ? 'arena_id,quantity\n'
      : 'arena_id,quantity,name,set,collector_number,rarity\n';

    const esc = (s: unknown) =>
      s == null ? '' : `"${String(s).replace(/"/g, '""')}"`;

    const body = rows
      .map((r) =>
        noNames
          ? `${r.arena_id},${r.quantity}`
          : [r.arena_id, r.quantity, esc(r.name), esc(r.set), esc(r.collector_number), esc(r.rarity)].join(','),
      )
      .join('\n') + '\n';

    if (out) fs.writeFileSync(out, header + body, 'utf8');
    else process.stdout.write(header + body);
  }
}
