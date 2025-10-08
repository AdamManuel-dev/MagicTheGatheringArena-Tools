import fs from 'fs';
import path from 'path';

import {type DataStore, type MatchRecord, type DeckRecord} from './types';

const DATA_DIR = path.join(process.cwd(), 'cache', 'data');
const DATA_FILE = path.join(DATA_DIR, 'datastore.json');

const emptyStore = (): DataStore => ({matches: [], decks: [], updatedAt: new Date().toISOString()});

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
}

export function loadDataStore(customPath?: string): DataStore {
  const file = customPath ? path.resolve(customPath) : DATA_FILE;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw) as DataStore;
    if (!parsed.matches || !Array.isArray(parsed.matches)) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
  }
}

export function saveDataStore(store: DataStore, customPath?: string): void {
  const file = customPath ? path.resolve(customPath) : DATA_FILE;
  if (!customPath) ensureDataDir();
  const withTimestamp: DataStore = {...store, updatedAt: new Date().toISOString()};
  fs.writeFileSync(file, JSON.stringify(withTimestamp, null, 2), 'utf8');
}

export function upsertMatches(store: DataStore, matches: Array<MatchRecord>): DataStore {
  const existingById = new Map(store.matches.map((match) => [match.matchId, match] as const));
  for (const match of matches) {
    existingById.set(match.matchId, match);
  }
  const nextMatches = Array.from(existingById.values()).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return {...store, matches: nextMatches, updatedAt: new Date().toISOString()};
}

export function upsertDecks(store: DataStore, decks: Array<DeckRecord>): DataStore {
  const existingById = new Map(store.decks.map((deck) => [deck.deckId, deck] as const));
  for (const deck of decks) {
    existingById.set(deck.deckId, deck);
  }
  return {...store, decks: Array.from(existingById.values()), updatedAt: new Date().toISOString()};
}
