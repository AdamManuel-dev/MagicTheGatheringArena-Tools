export type MatchResult = 'win' | 'loss' | 'draw';

export interface GameRecord {
  gameId: string;
  result: MatchResult;
  opponentArchetype?: string;
  durationSeconds?: number;
}

export interface MatchRecord {
  matchId: string;
  queue: string;
  deckId?: string;
  deckName?: string;
  opponent?: string;
  opponentArchetype?: string;
  startedAt: string;
  endedAt?: string;
  result: MatchResult;
  games: Array<GameRecord>;
}

export interface DeckRecord {
  deckId: string;
  name: string;
  format: string;
}

export interface DataStore {
  matches: Array<MatchRecord>;
  decks: Array<DeckRecord>;
  updatedAt: string;
}

export type StatGroup = 'deck' | 'queue' | 'opponentArchetype';

export interface MatchStatRow {
  group: StatGroup;
  key: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}
