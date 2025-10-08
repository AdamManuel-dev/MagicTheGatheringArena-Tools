/**
 * @fileoverview Opponent:seen command for extracting opponent cards from match logs
 *
 * Features: Match filtering, time ranges, CSV/JSON output, Scryfall resolution
 * Main APIs: Seen.run()
 * Constraints: Requires detailed logging enabled in MTGA, macOS-specific paths
 * Patterns: oclif Command framework with comprehensive flag support
 */

import {Command, Flags} from '@oclif/core';
import {
  Match,
  parseMatches,
  readMatchLogs,
  aggregateCardsByMatch,
  EventType,
} from '../../lib/matches';
import {createTimeFilter, isDateInRange, TimeFilter} from '../../lib/time-utils';
import {getCardByArenaId, loadBulkMap, ScryfallCardLite} from '../../lib/scryfall';
import fs from 'fs';

type MatchRow = {
  match_id: string;
  started_at: string;
  opponent: string;
  arena_id: number;
  card_name?: string | null;
  set?: string | null;
  collector_number?: string | null;
  first_seen: EventType;
  seen_count: number;
};

type AggregatedCardRow = {
  arena_id: number;
  card_name?: string | null;
  set?: string | null;
  collector_number?: string | null;
  rarity?: string | null;
  seen_total: number;
  match_count: number;
};

export default class Seen extends Command {
  static summary = 'Extract opponent cards seen from MTG Arena match logs (macOS).';

  static description = [
    'Parses MTG Arena Detailed Logs to reconstruct cards your opponents used.',
    'Tracks cast spells, permanents entering battlefield, revealed cards, and zone moves.',
    'Requires Detailed Logs (Plugin Support) enabled in Arena settings.',
  ].join(' ');

  static examples = [
    '$ mtga-collection opponent:seen',
    '$ mtga-collection opponent:seen --json --limit 50',
    '$ mtga-collection opponent:seen --opponent "CoolMage#12345"',
    '$ mtga-collection opponent:seen --since 7d',
    '$ mtga-collection opponent:seen --from 2025-10-01 --to 2025-10-08',
    '$ mtga-collection opponent:seen --group-by card --sort desc',
    '$ mtga-collection opponent:seen --bulk --out seen_opponents.csv',
  ];

  static flags = {
    json: Flags.boolean({description: 'output JSON instead of CSV', default: false}),
    out: Flags.string({description: 'write to file instead of stdout'}),
    limit: Flags.integer({description: 'number of matches to scan', default: 10}),
    since: Flags.string({
      description: 'relative time window (e.g., 24h, 7d, 30d)',
      exclusive: ['from', 'to'],
    }),
    from: Flags.string({
      description: 'ISO start date (use with --to)',
      dependsOn: ['to'],
    }),
    to: Flags.string({
      description: 'ISO end date (use with --from)',
      dependsOn: ['from'],
    }),
    opponent: Flags.string({description: 'filter by opponent name/tag'}),
    'group-by': Flags.string({
      description: 'grouping mode',
      options: ['match', 'card'],
      default: 'match',
    }),
    include: Flags.string({
      description: 'comma-separated event types to track',
      default: 'cast,etb,revealed,move',
    }),
    'no-names': Flags.boolean({
      description: 'skip Scryfall lookups (arena_id + qty only)',
      default: false,
    }),
    bulk: Flags.boolean({
      description: 'use Scryfall bulk dataset for faster name resolution',
      default: false,
    }),
    log: Flags.string({description: 'custom path to Player.log'}),
    sort: Flags.string({
      description: 'sort order for aggregated results',
      options: ['asc', 'desc'],
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(Seen);

    // Read match logs
    const logData = readMatchLogs(flags.log);
    if (!logData.text) {
      this.error(
        'Could not read Player.log. Verify MTG Arena is installed and Detailed Logs are enabled.\n' +
        'macOS path: ~/Library/Application Support/com.wizards.mtga/Logs/Logs/Player.log'
      );
    }

    // Parse event types
    const includeEvents = flags.include.split(',').map((e) => e.trim() as EventType);

    // Parse matches
    let matches = parseMatches(logData.text, {
      limit: flags.limit,
      includeEvents,
    });

    if (matches.length === 0) {
      this.error(
        'No matches found in the log. Ensure:\n' +
        '1. Detailed Logs (Plugin Support) are enabled in Arena\n' +
        '2. You have played at least one match this session'
      );
    }

    // Apply time filter
    const timeFilter = createTimeFilter({
      since: flags.since,
      from: flags.from,
      to: flags.to,
    });

    matches = matches.filter((m) => isDateInRange(m.startedAt, timeFilter));

    // Apply opponent filter
    if (flags.opponent) {
      matches = matches.filter((m) => m.opponent === flags.opponent);
    }

    if (matches.length === 0) {
      this.error('No matches found matching the specified filters.');
    }

    // Group by mode
    if (flags['group-by'] === 'card') {
      await this.outputAggregated(matches, flags);
    } else {
      await this.outputByMatch(matches, flags);
    }
  }

  private async outputByMatch(matches: Match[], flags: any): Promise<void> {
    const rows: MatchRow[] = [];

    // Resolve names if needed
    let nameMap: Map<number, ScryfallCardLite> | null = null;
    if (!flags['no-names']) {
      if (flags.bulk) {
        try {
          nameMap = await loadBulkMap();
        } catch (e: any) {
          this.warn(`Bulk load failed: ${e?.message ?? e}. Falling back to per-card lookups…`);
        }
      }
    }

    for (const match of matches) {
      for (const [arenaId, card] of match.opponentCards) {
        let cardInfo: ScryfallCardLite | null = null;

        if (!flags['no-names']) {
          if (nameMap) {
            cardInfo = nameMap.get(arenaId) || null;
          } else {
            cardInfo = await getCardByArenaId(arenaId);
          }
        }

        rows.push({
          match_id: match.matchId,
          started_at: match.startedAt.toISOString(),
          opponent: match.opponent || 'Unknown',
          arena_id: arenaId,
          card_name: cardInfo?.name ?? null,
          set: cardInfo?.set ?? null,
          collector_number: cardInfo?.collector_number ?? null,
          first_seen: card.firstSeen,
          seen_count: card.seenCount,
        });
      }
    }

    if (flags.json) {
      const payload = JSON.stringify(
        {
          matches_scanned: matches.length,
          cards: rows,
        },
        null,
        2
      );
      if (flags.out) fs.writeFileSync(flags.out, payload, 'utf8');
      else process.stdout.write(payload + '\n');
    } else {
      // CSV output
      const header = flags['no-names']
        ? 'match_id,started_at,opponent,arena_id,first_seen,seen_count\n'
        : 'match_id,started_at,opponent,card_name,set,collector_number,arena_id,first_seen,seen_count\n';

      const esc = (s: unknown) =>
        s == null ? '' : `"${String(s).replace(/"/g, '""')}"`;

      const body = rows
        .map((r) =>
          flags['no-names']
            ? `${esc(r.match_id)},${esc(r.started_at)},${esc(r.opponent)},${r.arena_id},${esc(r.first_seen)},${r.seen_count}`
            : `${esc(r.match_id)},${esc(r.started_at)},${esc(r.opponent)},${esc(r.card_name)},${esc(r.set)},${esc(r.collector_number)},${r.arena_id},${esc(r.first_seen)},${r.seen_count}`
        )
        .join('\n') + '\n';

      if (flags.out) fs.writeFileSync(flags.out, header + body, 'utf8');
      else process.stdout.write(header + body);
    }
  }

  private async outputAggregated(matches: Match[], flags: any): Promise<void> {
    const aggregated = aggregateCardsByMatch(matches);
    let rows: AggregatedCardRow[] = [];

    // Resolve names if needed
    let nameMap: Map<number, ScryfallCardLite> | null = null;
    if (!flags['no-names']) {
      if (flags.bulk) {
        try {
          nameMap = await loadBulkMap();
        } catch (e: any) {
          this.warn(`Bulk load failed: ${e?.message ?? e}. Falling back to per-card lookups…`);
        }
      }
    }

    for (const [arenaId, data] of aggregated) {
      let cardInfo: ScryfallCardLite | null = null;

      if (!flags['no-names']) {
        if (nameMap) {
          cardInfo = nameMap.get(arenaId) || null;
        } else {
          cardInfo = await getCardByArenaId(arenaId);
        }
      }

      rows.push({
        arena_id: arenaId,
        card_name: cardInfo?.name ?? null,
        set: cardInfo?.set ?? null,
        collector_number: cardInfo?.collector_number ?? null,
        rarity: cardInfo?.rarity ?? null,
        seen_total: data.seenTotal,
        match_count: data.matches.length,
      });
    }

    // Apply sorting
    if (flags.sort) {
      rows.sort((a, b) => {
        const diff = a.seen_total - b.seen_total;
        return flags.sort === 'desc' ? -diff : diff;
      });
    }

    if (flags.json) {
      const payload = JSON.stringify(
        {
          scope: {
            matches_scanned: matches.length,
            unique_cards: rows.length,
          },
          cards: rows,
        },
        null,
        2
      );
      if (flags.out) fs.writeFileSync(flags.out, payload, 'utf8');
      else process.stdout.write(payload + '\n');
    } else {
      // CSV output
      const header = flags['no-names']
        ? 'arena_id,seen_total,match_count\n'
        : 'arena_id,card_name,set,collector_number,rarity,seen_total,match_count\n';

      const esc = (s: unknown) =>
        s == null ? '' : `"${String(s).replace(/"/g, '""')}"`;

      const body = rows
        .map((r) =>
          flags['no-names']
            ? `${r.arena_id},${r.seen_total},${r.match_count}`
            : `${r.arena_id},${esc(r.card_name)},${esc(r.set)},${esc(r.collector_number)},${esc(r.rarity)},${r.seen_total},${r.match_count}`
        )
        .join('\n') + '\n';

      if (flags.out) fs.writeFileSync(flags.out, header + body, 'utf8');
      else process.stdout.write(header + body);
    }
  }
}
