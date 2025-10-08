/**
 * @fileoverview collection:export command for MTG Arena collection export.
 *
 * Features: CSV/JSON output, Scryfall name resolution, bulk or per-card lookups
 * Main APIs: CollectionExport.run()
 * Constraints: macOS-only, requires detailed logging enabled in MTGA
 * Patterns: Uses oclif Command framework with typed flags
 */

import {Flags} from '@oclif/core';
import {toCsv, toJson, type CsvColumn} from '../../lib/formatters';
import {extractOwnedFromLog, readBestLog} from '../../lib/logs';
import {getCardByArenaId, loadBulkMap, type ScryfallCardLite} from '../../lib/scryfall';
import {TracedCommand} from '../../lib/tracing';
import fs from 'fs';

type Row = {
  arena_id: number;
  quantity: number;
  name?: string | null;
  set?: string | null;
  collector_number?: string | null;
  rarity?: string | null;
} & Record<string, string | number | null | undefined>;

export default class CollectionExport extends TracedCommand {
  static id = 'collection:export';

  static summary = 'Extract owned MTG Arena cards from Player.log with optional Scryfall enrichment.';

  static description = [
    'Reads ~/Library/Logs/Wizards Of The Coast/MTGA/Player.log (and player-prev.log)',
    'to gather arena_id → quantity pairs. Optionally resolves to names via Scryfall.',
  ].join(' ');

  static examples = [
    '$ mtga-collection collection:export > collection.csv',
    '$ mtga-collection collection:export --json > collection.json',
    '$ mtga-collection collection:export --no-names --out arena_ids.csv',
    '$ mtga-collection collection:export --bulk --out collection.csv',
    '$ mtga-collection collection:export --log ~/Desktop/Player.log',
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

  protected async execute(): Promise<void> {
    const {flags} = await this.parse(CollectionExport);
    const {log: customLog, json, bulk, out} = flags;
    const noNames = flags['no-names'];

    const picked = await readBestLog(customLog);
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

    let rows: Array<Row> = [];
    if (noNames) {
      rows = [...owned.entries()].map(([arena_id, quantity]) => ({arena_id, quantity}));
    } else {
      if (bulk) {
        if (!json) this.log('Refreshing Scryfall bulk cache (default_cards)…');
        let map: Map<number, ScryfallCardLite> | null = null;
        try {
          map = await loadBulkMap({forceRefresh: true});
          if (!json) this.log(`Loaded ${map.size} cards from Scryfall bulk cache.`);
        } catch (error: unknown) {
          const reason = error instanceof Error ? error.message : String(error);
          this.warn(`Bulk load failed: ${reason}. Falling back to per-card lookups…`);
        }

        if (map) {
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
          // Bulk load failed, fall back to per-card lookups
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
          }
        }
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
      const payload = toJson({count: rows.length, cards: rows});
      if (out) fs.writeFileSync(out, payload, 'utf8');
      else process.stdout.write(payload);
      return;
    }

    const columns: Array<CsvColumn<Row>> = noNames
      ? [
          {key: 'arena_id', header: 'arena_id'},
          {key: 'quantity', header: 'quantity'},
        ]
      : [
          {key: 'arena_id', header: 'arena_id'},
          {key: 'quantity', header: 'quantity'},
          {key: 'name', header: 'name'},
          {key: 'set', header: 'set'},
          {key: 'collector_number', header: 'collector_number'},
          {key: 'rarity', header: 'rarity'},
        ];

    const csv = toCsv<Row>(rows, {
      columns,
      includeHeader: true,
    });

    if (out) fs.writeFileSync(out, csv, 'utf8');
    else process.stdout.write(csv);
  }
}
