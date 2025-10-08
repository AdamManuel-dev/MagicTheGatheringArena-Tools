/**
 * @fileoverview matches:ingest command to update datastore from Player.log matches.
 */

import {Flags} from '@oclif/core';

import {ingestMatches} from '../../lib/data/ingest';
import {TracedCommand} from '../../lib/tracing';

export default class MatchesIngest extends TracedCommand {
  static id = 'matches:ingest';

  static summary = 'Ingest match summaries from Player.log into the local datastore.';

  static examples = [
    '$ mtga-collection matches:ingest',
    '$ mtga-collection matches:ingest --log ~/Desktop/Player.log --datastore cache/data/datastore.json',
  ];

  static flags = {
    log: Flags.string({description: 'custom Player.log path'}),
    datastore: Flags.string({description: 'custom datastore path'}),
  } as const;

  protected async execute(): Promise<void> {
    const {flags} = await this.parse(MatchesIngest);
    const {added} = await ingestMatches({logPath: flags.log, datastorePath: flags.datastore});
    this.log(added === 0 ? 'No new matches found.' : `Ingested ${added} new match${added === 1 ? '' : 'es'}.`);
  }
}
