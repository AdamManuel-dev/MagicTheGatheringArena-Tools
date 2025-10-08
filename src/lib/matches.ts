/**
 * @fileoverview MTG Arena match log parser for opponent card tracking
 *
 * Features: Extracts match data, opponent cards seen, event tracking
 * Main APIs: parseMatches(), extractOpponentCards()
 * Constraints: Requires detailed logging enabled in MTGA
 * Patterns: Parses GRE updates, tracks zone changes and card events
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

export const defaultMatchLogDir = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'com.wizards.mtga',
  'Logs',
  'Logs',
);

export const defaultMatchLogs: Array<string> = [
  path.join(defaultMatchLogDir, 'Player.log'),
  path.join(defaultMatchLogDir, 'Player-prev.log'),
];

export type EventType = 'cast' | 'etb' | 'revealed' | 'move';

export type CardEvent = {
  arenaId: number;
  eventType: EventType;
  timestamp: Date;
};

export type OpponentCard = {
  arenaId: number;
  firstSeen: EventType;
  seenCount: number;
  events: Array<CardEvent>;
};

export type Match = {
  matchId: string;
  startedAt: Date;
  endedAt?: Date;
  opponent?: string;
  opponentCards: Map<number, OpponentCard>;
};

export function readMatchLogs(custom?: string): {path: string; text: string} {
  const candidates = custom ? [custom] : defaultMatchLogs;
  let combined = {path: '', text: ''};

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const text = fs.readFileSync(p, 'utf8');
      if (combined.text.length === 0) {
        combined = {path: p, text};
      } else {
        // Append older logs for historical data
        combined.text = combined.text + '\n' + text;
      }
    }
  }

  return combined;
}

function parseTimestamp(line: string): Date | null {
  // Arena logs format: [UnityCrossThreadLogger]2025-10-07 23:14:12
  const match = line.match(/\[UnityCrossThreadLogger\](\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
  if (match) {
    return new Date(match[1] + 'Z'); // Treat as UTC
  }
  return null;
}

function extractJSON(line: string): Record<string, unknown> | null {
  // Find JSON objects in log lines
  const jsonStart = line.indexOf('{');
  if (jsonStart === -1) return null;

  try {
    // Try to parse from first { to end of line
    const jsonStr = line.slice(jsonStart);
    const parsed = JSON.parse(jsonStr);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    // Try to find complete JSON object with brace matching
    let depth = 0;
    let inStr = false;
    let esc = false;

    for (let i = jsonStart; i < line.length; i++) {
      const c = line[i];

      if (inStr) {
        if (esc) esc = false;
        else if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
        continue;
      }

      if (c === '"') {
        inStr = true;
        continue;
      }

      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          try {
            const parsed = JSON.parse(line.slice(jsonStart, i + 1));
            return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
          } catch {
            return null;
          }
        }
      }
    }
  }

  return null;
}

function detectEventType(data: Record<string, unknown>, playerId: number): EventType | null {
  // Detect card event types from GRE updates

  const event = data.greToClientEvent;
  if (!event || typeof event !== 'object') return null;

  const messages = (event as {greToClientMessages?: unknown}).greToClientMessages;
  if (!Array.isArray(messages)) return null;

  for (const rawMessage of messages) {
    if (!rawMessage || typeof rawMessage !== 'object') continue;
    const message = rawMessage as Record<string, unknown>;
    const type = typeof message.type === 'string' ? message.type : undefined;

    if (type === 'GREMessageType_QueuedGameStateMessage') {
      const gameState = message.gameStateMessage;
      if (gameState && typeof gameState === 'object') {
        const objects = (gameState as {gameObjects?: unknown}).gameObjects;
        if (Array.isArray(objects)) {
          for (const rawObject of objects) {
            if (!rawObject || typeof rawObject !== 'object') continue;
            const obj = rawObject as {
              ownerSeatId?: unknown;
              grpId?: unknown;
              zoneId?: unknown;
            };
            const ownerSeatId = typeof obj.ownerSeatId === 'number' ? obj.ownerSeatId : undefined;
            const grpId = typeof obj.grpId === 'number' ? obj.grpId : undefined;
            const zoneId = typeof obj.zoneId === 'number' ? obj.zoneId : undefined;
            if (typeof grpId === 'number' && ownerSeatId !== playerId && typeof zoneId === 'number') {
              if (zoneId === 4) return 'cast'; // Stack zone
              if (zoneId === 2) return 'etb'; // Battlefield zone
              if (zoneId === 3) return 'move'; // Graveyard zone
              if (zoneId === 5) return 'move'; // Exile zone
            }
          }
        }
      }
    }

    if (type === 'GREMessageType_UIMessage') {
      const uiMessage = message.uiMessage;
      if (uiMessage && typeof uiMessage === 'object') {
        const uiType = (uiMessage as {type?: unknown}).type;
        if (uiType === 'ClientMessageType_RevealedCards') {
          return 'revealed';
        }
      }
    }
  }

  return null;
}

function extractArenaIds(data: Record<string, unknown>, playerId: number): Array<number> {
  const ids: Array<number> = [];

  const event = data.greToClientEvent;
  if (!event || typeof event !== 'object') return ids;
  const messages = (event as {greToClientMessages?: unknown}).greToClientMessages;
  if (!Array.isArray(messages)) return ids;

  for (const rawMessage of messages) {
    if (!rawMessage || typeof rawMessage !== 'object') continue;
    const message = rawMessage as Record<string, unknown>;
    if (message.type !== 'GREMessageType_QueuedGameStateMessage') continue;
    const gameState = message.gameStateMessage;
    if (!gameState || typeof gameState !== 'object') continue;
    const objects = (gameState as {gameObjects?: unknown}).gameObjects;
    if (!Array.isArray(objects)) continue;
    for (const rawObject of objects) {
      if (!rawObject || typeof rawObject !== 'object') continue;
      const obj = rawObject as {ownerSeatId?: unknown; grpId?: unknown};
      const ownerSeatId = typeof obj.ownerSeatId === 'number' ? obj.ownerSeatId : undefined;
      const grpId = typeof obj.grpId === 'number' ? obj.grpId : undefined;
      if (typeof grpId === 'number' && ownerSeatId !== playerId) {
        ids.push(grpId);
      }
    }
  }

  return ids;
}

export function parseMatches(
  logText: string,
  options: {
    limit?: number;
    includeEvents?: Array<EventType>;
  } = {}
): Array<Match> {
  const limit = options.limit ?? 10;
  const includeEvents = options.includeEvents ?? (['cast', 'etb', 'revealed', 'move'] as Array<EventType>);

  const lines = logText.split('\n');
  const matches: Array<Match> = [];
  let currentMatch: Match | null = null;
  let playerId = 1; // Default assumption, updated when detected

  for (const line of lines) {
    const timestamp = parseTimestamp(line);
    if (!timestamp) continue;

    const json = extractJSON(line);
    if (!json) continue;

    // Detect match start
    if (line.includes('MatchCreated') || line.includes('Event_MatchCreated')) {
      const matchIdValue = json.matchId;
      const rawParams = json.params;
      const params = typeof rawParams === 'object' && rawParams !== null ? (rawParams as Record<string, unknown>) : undefined;
      const paramMatchId = params && typeof params.matchId === 'string' ? params.matchId : undefined;
      const matchId = typeof matchIdValue === 'string' && matchIdValue.length > 0
        ? matchIdValue
        : paramMatchId ?? `match_${Date.now()}`;
      currentMatch = {
        matchId: String(matchId),
        startedAt: timestamp,
        opponentCards: new Map(),
      };

      // Try to extract opponent name
      if (typeof json.opponentScreenName === 'string') {
        currentMatch.opponent = json.opponentScreenName;
      }
    }

    // Detect player ID
    if (typeof json.playerId === 'number') {
      playerId = json.playerId;
    }

    // Track card events
    if (currentMatch) {
      const eventType = detectEventType(json, playerId);
      if (eventType && includeEvents.includes(eventType)) {
        const arenaIds = extractArenaIds(json, playerId);

        for (const arenaId of arenaIds) {
          const existing = currentMatch.opponentCards.get(arenaId);

          if (existing) {
            existing.seenCount++;
            existing.events.push({arenaId, eventType, timestamp});
          } else {
            currentMatch.opponentCards.set(arenaId, {
              arenaId,
              firstSeen: eventType,
              seenCount: 1,
              events: [{arenaId, eventType, timestamp}],
            });
          }
        }
      }
    }

    // Detect match end
    if (currentMatch && (line.includes('MatchCompleted') || line.includes('Event_MatchEnd'))) {
      currentMatch.endedAt = timestamp;
      matches.push(currentMatch);
      currentMatch = null;

      if (matches.length >= limit) {
        break;
      }
    }
  }

  // Include ongoing match if exists
  if (currentMatch && matches.length < limit) {
    matches.push(currentMatch);
  }

  return matches.slice(0, limit);
}

export function aggregateCardsByMatch(matches: Array<Match>): Map<number, {seenTotal: number; matches: Array<string>}> {
  const aggregated = new Map<number, {seenTotal: number; matches: Array<string>}>();

  for (const match of matches) {
    for (const [arenaId, card] of match.opponentCards) {
      const existing = aggregated.get(arenaId);

      if (existing) {
        existing.seenTotal += card.seenCount;
        existing.matches.push(match.matchId);
      } else {
        aggregated.set(arenaId, {
          seenTotal: card.seenCount,
          matches: [match.matchId],
        });
      }
    }
  }

  return aggregated;
}
