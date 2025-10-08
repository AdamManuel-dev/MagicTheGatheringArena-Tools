import {type DataStore, type MatchRecord, type MatchStatRow, type StatGroup} from './types';

function normalizeKey(group: StatGroup, match: MatchRecord): string | undefined {
  switch (group) {
    case 'deck':
      return match.deckName ?? match.deckId ?? undefined;
    case 'queue':
      return match.queue;
    case 'opponentArchetype':
      return match.opponentArchetype ?? match.opponent ?? undefined;
    default:
      return undefined;
  }
}

export function aggregateStats(store: DataStore, groups: Array<StatGroup>): Array<MatchStatRow> {
  const rows: Array<MatchStatRow> = [];
  for (const group of groups) {
    const counters = new Map<string, MatchStatRow>();
    for (const match of store.matches) {
      const key = normalizeKey(group, match);
      if (!key) continue;
      const existing = counters.get(key) ?? {group, key, matches: 0, wins: 0, losses: 0, draws: 0, winRate: 0};
      existing.matches += 1;
      if (match.result === 'win') existing.wins += 1;
      else if (match.result === 'loss') existing.losses += 1;
      else existing.draws += 1;
      existing.winRate = existing.matches > 0 ? existing.wins / existing.matches : 0;
      counters.set(key, existing);
    }
    rows.push(...Array.from(counters.values()));
  }
  return rows.sort((a, b) => b.matches - a.matches);
}

export function filterMatches(store: DataStore, options: {queue?: string; deck?: string; since?: Date; from?: Date; to?: Date}): Array<MatchRecord> {
  return store.matches.filter((match) => {
    if (options.queue && match.queue !== options.queue) return false;
    if (options.deck && match.deckName !== options.deck && match.deckId !== options.deck) return false;
    if (options.since) {
      if (new Date(match.startedAt) < options.since) return false;
    }
    if (options.from && new Date(match.startedAt) < options.from) return false;
    if (options.to && new Date(match.startedAt) > options.to) return false;
    return true;
  });
}

export function summarize(store: DataStore, matches: Array<MatchRecord>, groups: Array<StatGroup>): Array<MatchStatRow> {
  const tempStore: DataStore = {...store, matches};
  return aggregateStats(tempStore, groups);
}
