import {LogIngestionService} from '../logs';
import {type DataStore, type MatchRecord, type GameRecord} from './types';
import {loadDataStore, saveDataStore, upsertMatches} from './datastore';

export type IngestOptions = {
  logPath?: string;
  datastorePath?: string;
};

type MatchSummary = {
  event: 'matchSummary';
  matchId: string;
  queue: string;
  deckId?: string;
  deckName?: string;
  opponent?: string;
  opponentArchetype?: string;
  startedAt: string;
  endedAt?: string;
  result: 'win' | 'loss' | 'draw';
  games?: Array<{
    gameId: string;
    result: 'win' | 'loss' | 'draw';
    opponentArchetype?: string;
    durationSeconds?: number;
  }>;
};

function isMatchSummary(json: unknown): json is MatchSummary {
  if (!json || typeof json !== 'object') return false;
  const summary = json as Record<string, unknown>;
  return (
    summary.event === 'matchSummary' &&
    typeof summary.matchId === 'string' &&
    typeof summary.queue === 'string' &&
    typeof summary.startedAt === 'string' &&
    typeof summary.result === 'string'
  );
}

function extractJSON(line: string): Record<string, unknown> | null {
  const start = line.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < line.length; i++) {
    const char = line[i];
    if (inStr) {
      if (esc) esc = false;
      else if (char === '\\') esc = true;
      else if (char === '"') inStr = false;
      continue;
    }
    if (char === '"') {
      inStr = true;
      continue;
    }
    if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) {
        try {
          const json = JSON.parse(line.slice(start, i + 1));
          return typeof json === 'object' && json !== null ? (json as Record<string, unknown>) : null;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export function parseMatchSummaries(text: string): Array<MatchRecord> {
  const matches: Array<MatchRecord> = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.includes('{')) continue;
    const json = extractJSON(line);
    if (!json) continue;
    if (!isMatchSummary(json)) continue;
    const games: Array<GameRecord> = Array.isArray(json.games)
      ? json.games
          .filter((game): game is {gameId: string; result: 'win' | 'loss' | 'draw'; opponentArchetype?: string; durationSeconds?: number} =>
            !!game && typeof game.gameId === 'string' && typeof game.result === 'string',
          )
          .map((game) => ({
            gameId: game.gameId,
            result: game.result,
            opponentArchetype: game.opponentArchetype,
            durationSeconds: game.durationSeconds,
          }))
      : [];

    matches.push({
      matchId: json.matchId,
      queue: json.queue,
      deckId: json.deckId,
      deckName: json.deckName,
      opponent: json.opponent,
      opponentArchetype: json.opponentArchetype,
      startedAt: json.startedAt,
      endedAt: json.endedAt,
      result: json.result,
      games,
    });
  }
  return matches;
}

export async function ingestMatches(options: IngestOptions = {}): Promise<{store: DataStore; added: number}> {
  const service = new LogIngestionService();
  const snapshot = await service.readLatest(options.logPath);
  const matches = parseMatchSummaries(snapshot.text ?? '');
  const store = loadDataStore(options.datastorePath);
  const existingIds = new Set(store.matches.map((match) => match.matchId));
  const newMatches = matches.filter((match) => !existingIds.has(match.matchId));
  if (newMatches.length === 0) {
    return {store, added: 0};
  }
  const updated = upsertMatches(store, newMatches);
  saveDataStore(updated, options.datastorePath);
  return {store: updated, added: newMatches.length};
}
