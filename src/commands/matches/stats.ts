/**
 * @fileoverview matches:stats command for aggregated match statistics.
 */

import {Flags} from '@oclif/core';
import fs from 'fs';

import {toCsv, toJson, toTable, type CsvColumn} from '../../lib/formatters';
import {loadDataStore} from '../../lib/data/datastore';
import {aggregateStats, filterMatches, summarize} from '../../lib/data/stats';
import {type StatGroup} from '../../lib/data/types';
import {createTimeFilter} from '../../lib/time-utils';
import {TracedCommand} from '../../lib/tracing';

export default class MatchesStats extends TracedCommand {
  static id = 'matches:stats';

  static summary = 'Aggregate match performance by deck, queue, or opponent archetype.';

  static examples = [
    '$ mtga-collection matches:stats --group-by deck',
    '$ mtga-collection matches:stats --queue ranked --since 7d --json',
    '$ mtga-collection matches:stats --deck "Mono Red" --group-by opponentArchetype --out stats.csv',
  ];

  static flags = {
    'group-by': Flags.string({
      description: 'Grouping for stats (deck, queue, opponentArchetype)',
      default: 'deck',
      options: ['deck', 'queue', 'opponentArchetype'],
    }),
    queue: Flags.string({description: 'Filter by queue name'}),
    deck: Flags.string({description: 'Filter by deck name or deck ID'}),
    since: Flags.string({description: 'Relative time filter (e.g. 7d, 24h)'}),
    from: Flags.string({description: 'ISO start date'}),
    to: Flags.string({description: 'ISO end date'}),
    json: Flags.boolean({description: 'Output JSON instead of table/CSV', default: false}),
    out: Flags.string({description: 'Write output to file'}),
    datastore: Flags.string({description: 'Custom datastore path (for testing)'}),
  } as const;

  protected async execute(): Promise<void> {
    const {flags} = await this.parse(MatchesStats);
    const groupBy = flags['group-by'] as StatGroup;
    const store = loadDataStore(flags.datastore);

    const timeFilter = createTimeFilter({since: flags.since, from: flags.from, to: flags.to});
    const matches = filterMatches(store, {
      queue: flags.queue,
      deck: flags.deck,
      since: timeFilter.from,
      from: timeFilter.from,
      to: timeFilter.to,
    });

    const summary = summarize(store, matches, [groupBy]);

    if (flags.json) {
      const payload = toJson({groupBy, matches: summary});
      if (flags.out) fs.writeFileSync(flags.out, payload, 'utf8');
      else process.stdout.write(payload);
      return;
    }

    const rows = summary.map((row) => ({
      group: row.group,
      key: row.key,
      matches: row.matches,
      wins: row.wins,
      losses: row.losses,
      draws: row.draws,
      'win rate %': (row.winRate * 100).toFixed(1),
    }));

    const columns: Array<CsvColumn<typeof rows[number]>> = [
      {key: 'key', header: groupBy},
      {key: 'matches', header: 'Matches'},
      {key: 'wins', header: 'Wins'},
      {key: 'losses', header: 'Losses'},
      {key: 'draws', header: 'Draws'},
      {key: 'win rate %', header: 'Win Rate %'},
    ];

    if (flags.out) {
      const csv = toCsv(rows, {columns});
      fs.writeFileSync(flags.out, csv, 'utf8');
      return;
    }

    const table = toTable(rows, {
      columns: columns.map((column) => ({
        key: column.key,
        header: column.header ?? String(column.key),
        align: column.key === 'key' ? 'left' : 'right',
      })),
    });

    process.stdout.write(`${table}\n`);
  }
}
