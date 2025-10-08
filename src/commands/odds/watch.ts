/**
 * @fileoverview odds:watch command for live hypergeometric tracking.
 */

import {Flags} from '@oclif/core';
import fs from 'fs';
import path from 'path';

import {toTable} from '../../lib/formatters';
import {LogIngestionService} from '../../lib/logs';
import {LogsTool, buildOddsRows, type LogEvent} from '../../lib/logs/tool';
import {TracedCommand} from '../../lib/tracing';

interface DeckCard {
  arena_id: number;
  name?: string;
  quantity: number;
}

interface DeckGroup {
  id: string;
  label: string;
  arena_ids: Array<number>;
}

interface DeckFile {
  cards: Array<DeckCard>;
  groups?: Array<DeckGroup>;
}

type GroupState = {
  id: string;
  label: string;
  arenaIds: Array<number>;
  remaining: number;
};

type TableRow = {
  Target: string;
  Remaining: string;
  'Next Draw %': string;
  'Within 3 %': string;
  'Expected Draws': string;
};

function readDeck(deckPath: string): DeckFile {
  const resolved = path.resolve(deckPath);
  const raw = fs.readFileSync(resolved, 'utf8');
  const parsed = JSON.parse(raw) as DeckFile;
  if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
    throw new Error('Deck file must include a non-empty "cards" array.');
  }
  parsed.cards.forEach((card) => {
    if (typeof card.arena_id !== 'number' || typeof card.quantity !== 'number') {
      throw new Error('Each card requires numeric arena_id and quantity.');
    }
  });
  return parsed;
}

export default class OddsWatch extends TracedCommand {
  static id = 'odds:watch';

  static summary = 'Display live draw odds based on Player.log events.';

  static description = [
    'Streams Player.log for draw events, updating hypergeometric odds for tracked outs.',
    'Pass --replay to process a snapshot once for testing or analysis.',
  ].join(' ');

  static flags = {
    deck: Flags.string({description: 'path to deck JSON file', required: true}),
    log: Flags.string({description: 'custom Player.log path'}),
    track: Flags.integer({description: 'track specific arena_id (repeatable)', multiple: true}),
    seat: Flags.integer({description: 'player seat id (default 1)', default: 1}),
    replay: Flags.boolean({description: 'process snapshot once and exit', default: false}),
    'max-updates': Flags.integer({description: 'limit number of output updates (testing)', default: 0}),
    'poll-interval': Flags.integer({description: 'poll interval in ms for live mode', default: 500}),
  } as const;

  private librarySize = 0;
  private groupStates: Array<GroupState> = [];
  private groupMap = new Map<number, Array<GroupState>>();
  private updatesEmitted = 0;

  protected async execute(): Promise<void> {
    const {flags} = await this.parse(OddsWatch);
    const deck = readDeck(flags.deck);
    this.initializeState(deck, flags.track);

    const service = new LogIngestionService();
    const tool = new LogsTool({playerSeatId: flags.seat});

    if (flags.replay) {
      const snapshot = await service.readLatest(flags.log);
      this.processLogChunk(snapshot.text, tool);
      this.renderState();
      return;
    }

    const abort = new AbortController();
    const maxUpdates = flags['max-updates'] ?? 0;
    try {
      for await (const chunk of service.streamLive({
        customPath: flags.log,
        pollIntervalMs: flags['poll-interval'],
        startAtEnd: false,
        signal: abort.signal,
      })) {
        this.processLogChunk(chunk.data, tool);
        if (this.renderState()) {
          this.updatesEmitted += 1;
          if (maxUpdates > 0 && this.updatesEmitted >= maxUpdates) {
            abort.abort();
            break;
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      throw error;
    }
  }

  private initializeState(deck: DeckFile, trackedIds?: Array<number>): void {
    const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
    this.librarySize = totalCards;

    const groupDefinitions: Array<DeckGroup> = deck.groups ?? [];

    if (!groupDefinitions.length) {
      const selected = trackedIds && trackedIds.length > 0
        ? new Set(trackedIds)
        : new Set(deck.cards.slice(0, Math.min(deck.cards.length, 10)).map((card) => card.arena_id));

      for (const card of deck.cards) {
        if (!selected.has(card.arena_id)) continue;
        groupDefinitions.push({id: String(card.arena_id), label: card.name ?? String(card.arena_id), arena_ids: [card.arena_id]});
      }
    }

    const cardQuantities = new Map<number, number>();
    for (const card of deck.cards) {
      cardQuantities.set(card.arena_id, card.quantity);
    }

    this.groupStates = groupDefinitions.map((group) => {
      const remaining = group.arena_ids.reduce((sum, id) => sum + (cardQuantities.get(id) ?? 0), 0);
      const state: GroupState = {
        id: group.id,
        label: group.label,
        arenaIds: [...group.arena_ids],
        remaining,
      };
      for (const id of group.arena_ids) {
        const bucket = this.groupMap.get(id) ?? [];
        bucket.push(state);
        this.groupMap.set(id, bucket);
      }
      return state;
    });
  }

  private processLogChunk(chunk: string, tool: LogsTool): void {
    if (!chunk.trim()) return;
    const events = tool.parseLogText(chunk);
    if (!events.length) return;
    const draws = tool.filterDraws(events);
    for (const event of draws) {
      this.handleDraw(event);
    }
  }

  private handleDraw(event: LogEvent): void {
    if (this.librarySize > 0) this.librarySize -= 1;
    const groups = event.grpId != null ? this.groupMap.get(event.grpId) ?? [] : [];
    for (const group of groups) {
      if (group.remaining > 0) group.remaining -= 1;
    }
  }

  private renderState(): boolean {
    const rows = buildOddsRows({
      groups: this.groupStates.map((group) => ({label: group.label, remaining: group.remaining})),
      librarySize: Math.max(this.librarySize, 0),
    });

    const tableRows: Array<TableRow> = rows.map((row) => ({
      Target: row.label,
      Remaining: String(row.remaining),
      'Next Draw %': `${(row.nextDrawProbability * 100).toFixed(1)}%`,
      'Within 3 %': `${(row.withinThreeProbability * 100).toFixed(1)}%`,
      'Expected Draws': row.expectedDraws ? row.expectedDraws.toFixed(1) : '—',
    }));

    if (!tableRows.length) return false;
    const table = toTable<TableRow>(tableRows, {
      columns: [
        {key: 'Target', header: 'Target'},
        {key: 'Remaining', header: 'Remaining', align: 'right'},
        {key: 'Next Draw %', header: 'Next Draw %', align: 'right'},
        {key: 'Within 3 %', header: 'Within 3 %', align: 'right'},
        {key: 'Expected Draws', header: 'Expected Draws', align: 'right'},
      ],
    });

    process.stdout.write(`\nLibrary size: ${Math.max(this.librarySize, 0)}\n${table}\n`);
    return true;
  }
}
