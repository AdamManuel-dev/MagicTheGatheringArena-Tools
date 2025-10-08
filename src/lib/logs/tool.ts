import {hypergeometricAtLeast} from '../math';

export type LogEvent = {
  type: 'matchStart' | 'draw' | 'mulligan' | 'library';
  matchId?: string;
  ownerSeatId?: number;
  grpId?: number;
  count?: number;
  timestamp?: string;
};

function extractJSON(line: string): Record<string, unknown> | null {
  const start = line.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < line.length; i++) {
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

function parseCustomEvent(json: Record<string, unknown>): Array<LogEvent> {
  const events: Array<LogEvent> = [];
  if (typeof json.event !== 'string') return events;
  const matchId = typeof json.matchId === 'string' ? json.matchId : undefined;
  const ownerSeatId = typeof json.ownerSeatId === 'number' ? json.ownerSeatId : undefined;
  if (json.event === 'matchStart') {
    events.push({type: 'matchStart', matchId});
  } else if (json.event === 'draw') {
    const grpId = typeof json.grpId === 'number' ? json.grpId : undefined;
    events.push({type: 'draw', matchId, ownerSeatId, grpId, timestamp: typeof json.timestamp === 'string' ? json.timestamp : undefined});
  } else if (json.event === 'mulligan') {
    events.push({type: 'mulligan', matchId, ownerSeatId});
  } else if (json.event === 'library' && Array.isArray(json.cards)) {
    const cards = json.cards as Array<Record<string, unknown>>;
    for (const card of cards) {
      if (typeof card.grpId === 'number' && typeof card.quantity === 'number') {
        events.push({type: 'library', matchId, grpId: card.grpId, count: card.quantity, ownerSeatId});
      }
    }
  }
  return events;
}

function parseGreEvent(json: Record<string, unknown>): Array<LogEvent> {
  const gre = json.greToClientEvent;
  if (!gre || typeof gre !== 'object') return [];
  const messages = (gre as {greToClientMessages?: unknown}).greToClientMessages;
  if (!Array.isArray(messages)) return [];
  const events: Array<LogEvent> = [];

  for (const rawMessage of messages) {
    if (!rawMessage || typeof rawMessage !== 'object') continue;
    const message = rawMessage as Record<string, unknown>;
    const type = typeof message.type === 'string' ? message.type : undefined;
    if (type === 'GREMessageType_ZoneChange') {
      const zoneChange = message.zoneChange as Record<string, unknown> | undefined;
      if (!zoneChange) continue;
      const ownerSeatId = typeof (zoneChange as {ownerSeatId?: unknown}).ownerSeatId === 'number'
        ? (zoneChange as {ownerSeatId: number}).ownerSeatId
        : undefined;
      const matchIdValue = (message as {matchId?: unknown}).matchId ?? (json as {matchId?: unknown}).matchId;
      const matchId = typeof matchIdValue === 'string' ? matchIdValue : undefined;
      const grpId = typeof (zoneChange as {grpId?: unknown}).grpId === 'number' ? (zoneChange as {grpId: number}).grpId : undefined;
      const enter = typeof (zoneChange as {enterZone?: unknown}).enterZone === 'string' ? (zoneChange as {enterZone: string}).enterZone : undefined;
      const toZoneId = typeof (zoneChange as {zoneIdAfter?: unknown}).zoneIdAfter === 'number' ? (zoneChange as {zoneIdAfter: number}).zoneIdAfter : undefined;
      const exitZoneRaw = (zoneChange as {exitZone?: unknown}).exitZone;
      const exitZone = typeof exitZoneRaw === 'string' ? exitZoneRaw : undefined;
      const zoneIdBefore = typeof (zoneChange as {zoneIdBefore?: unknown}).zoneIdBefore === 'number' ? (zoneChange as {zoneIdBefore: number}).zoneIdBefore : undefined;
      const enterHand = enter?.toLowerCase() === 'hand' || toZoneId === 3;
      const exitLibrary = exitZone?.toLowerCase() === 'library' || zoneIdBefore === 2;
      if (enterHand && grpId !== undefined && exitLibrary) {
        events.push({type: 'draw', matchId, ownerSeatId, grpId});
      }
      continue;
    }

    if (type === 'GREMessageType_QueuedGameStateMessage') {
      const gameState = message.gameStateMessage as Record<string, unknown> | undefined;
      if (!gameState) continue;
      const zones = gameState.zones;
      if (!Array.isArray(zones)) continue;
      for (const zone of zones) {
        if (!zone || typeof zone !== 'object') continue;
        const z = zone as Record<string, unknown>;
        const zoneTypeRaw = (z as {zoneType?: unknown}).zoneType;
        const zoneType = typeof zoneTypeRaw === 'string' ? zoneTypeRaw.toLowerCase() : undefined;
        if (zoneType !== 'library') continue;
        const objects = z.objects;
        if (!Array.isArray(objects)) continue;
        for (const obj of objects) {
          if (!obj || typeof obj !== 'object') continue;
          const grpId = typeof (obj as {grpId?: unknown}).grpId === 'number' ? (obj as {grpId: number}).grpId : undefined;
          const quantity = typeof (obj as {quantity?: unknown}).quantity === 'number' ? (obj as {quantity: number}).quantity : 1;
          if (grpId !== undefined) {
            const ownerSeatId = typeof (obj as {ownerSeatId?: unknown}).ownerSeatId === 'number' ? (obj as {ownerSeatId: number}).ownerSeatId : undefined;
            const groupMatchIdValue = (message as {matchId?: unknown}).matchId;
            const groupMatchId = typeof groupMatchIdValue === 'string' ? groupMatchIdValue : undefined;
            events.push({type: 'library', matchId: groupMatchId, grpId, count: quantity, ownerSeatId});
          }
        }
      }
    }
  }

  return events;
}

export class LogsTool {
  constructor(private readonly options: {playerSeatId?: number} = {}) {}

  parseLogText(text: string): Array<LogEvent> {
    const events: Array<LogEvent> = [];
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (!line.includes('{')) continue;
      const json = extractJSON(line);
      if (!json) continue;
      const custom = parseCustomEvent(json);
      if (custom.length) {
        events.push(...custom);
        continue;
      }
      const parsed = parseGreEvent(json);
      if (parsed.length) events.push(...parsed);
    }
    return events;
  }

  filterDraws(events: Array<LogEvent>): Array<LogEvent> {
    const seatId = this.options.playerSeatId ?? 1;
    return events.filter((event) => event.type === 'draw' && (event.ownerSeatId == null || event.ownerSeatId === seatId));
  }
}

export type OddsRow = {
  label: string;
  remaining: number;
  nextDrawProbability: number;
  withinThreeProbability: number;
  expectedDraws: number | null;
};

export function buildOddsRows({
  groups,
  librarySize,
}: {
  groups: Array<{label: string; remaining: number}>;
  librarySize: number;
}): Array<OddsRow> {
  return groups.map((group) => {
    const {remaining} = group;
    const nextDrawProbability = remaining > 0 && librarySize > 0
      ? hypergeometricAtLeast({populationSize: librarySize, populationSuccesses: remaining, draws: 1, successes: 1})
      : 0;
    const withinThreeProbability = remaining > 0 && librarySize > 0
      ? hypergeometricAtLeast({populationSize: librarySize, populationSuccesses: remaining, draws: Math.min(3, librarySize), successes: 1})
      : 0;
    const expected = remaining > 0 ? librarySize / remaining : null;
    return {
      label: group.label,
      remaining,
      nextDrawProbability,
      withinThreeProbability,
      expectedDraws: expected,
    };
  });
}
