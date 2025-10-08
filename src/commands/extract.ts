/**
 * @fileoverview Legacy alias for collection:export command.
 */

import CollectionExport from './collection/export';

export default class ExtractLegacy extends CollectionExport {
  static id = 'extract';
  static summary = 'Alias for collection:export (will be deprecated after Alpha).';
  static hidden = false;
}
