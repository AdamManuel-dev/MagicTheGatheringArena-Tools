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

export const defaultMatchLogs = [
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
  events: CardEvent[];
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

function extractJSON(line: string): any | null {
  // Find JSON objects in log lines
  const jsonStart = line.indexOf('{');
  if (jsonStart === -1) return null;

  try {
    // Try to parse from first { to end of line
    const jsonStr = line.slice(jsonStart);
    return JSON.parse(jsonStr);
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
            return JSON.parse(line.slice(jsonStart, i + 1));
          } catch {
            return null;
          }
        }
      }
    }
  }

  return null;
}

function detectEventType(data: any, playerId: number): EventType | null {
  // Detect card event types from GRE updates

  // Check for spell cast
  if (data.greToClientEvent?.greToClientMessages) {
    for (const msg of data.greToClientEvent.greToClientMessages) {
      if (msg.type === 'GREMessageType_QueuedGameStateMessage') {
        const gameState = msg.gameStateMessage;
        if (gameState?.gameObjects) {
          for (const obj of gameState.gameObjects) {
            if (obj.ownerSeatId !== playerId && obj.grpId) {
              // Check zone changes
              if (obj.zoneId === 4) return 'cast'; // Stack zone
              if (obj.zoneId === 2) return 'etb';  // Battlefield zone
              if (obj.zoneId === 3) return 'move'; // Graveyard zone
              if (obj.zoneId === 5) return 'move'; // Exile zone
            }
          }
        }
      }

      // Check for revealed cards
      if (msg.type === 'GREMessageType_UIMessage') {
        if (msg.uiMessage?.type === 'ClientMessageType_RevealedCards') {
          return 'revealed';
        }
      }
    }
  }

  return null;
}

function extractArenaIds(data: any, playerId: number): number[] {
  const ids: number[] = [];

  // Extract from game objects
  if (data.greToClientEvent?.greToClientMessages) {
    for (const msg of data.greToClientEvent.greToClientMessages) {
      if (msg.type === 'GREMessageType_QueuedGameStateMessage') {
        const gameState = msg.gameStateMessage;
        if (gameState?.gameObjects) {
          for (const obj of gameState.gameObjects) {
            if (obj.ownerSeatId !== playerId && obj.grpId) {
              ids.push(obj.grpId);
            }
          }
        }
      }
    }
  }

  return ids;
}

export function parseMatches(
  logText: string,
  options: {
    limit?: number;
    includeEvents?: EventType[];
  } = {}
): Match[] {
  const {limit = 10, includeEvents = ['cast', 'etb', 'revealed', 'move']} = options;

  const lines = logText.split('\n');
  const matches: Match[] = [];
  let currentMatch: Match | null = null;
  let playerId = 1; // Default assumption, updated when detected

  for (const line of lines) {
    const timestamp = parseTimestamp(line);
    if (!timestamp) continue;

    const json = extractJSON(line);
    if (!json) continue;

    // Detect match start
    if (line.includes('MatchCreated') || line.includes('Event_MatchCreated')) {
      const matchId = json.matchId || json.params?.matchId || `match_${Date.now()}`;
      currentMatch = {
        matchId: String(matchId),
        startedAt: timestamp,
        opponentCards: new Map(),
      };

      // Try to extract opponent name
      if (json.opponentScreenName) {
        currentMatch.opponent = json.opponentScreenName;
      }
    }

    // Detect player ID
    if (json.playerId !== undefined) {
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

export function aggregateCardsByMatch(matches: Match[]): Map<number, {seenTotal: number; matches: string[]}> {
  const aggregated = new Map<number, {seenTotal: number; matches: string[]}>();

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
