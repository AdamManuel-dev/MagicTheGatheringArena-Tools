const {describe, it} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const {loadDataStore} = require('../../dist/lib/data/datastore');
const {aggregateStats, summarize, filterMatches} = require('../../dist/lib/data/stats');

const store = loadDataStore(path.join(__dirname, '../fixtures/datastore.sample.json'));

describe('data stats', () => {
  it('aggregates matches by deck', () => {
    const rows = aggregateStats(store, ['deck']);
    const monoRed = rows.find((row) => row.key === 'Mono Red');
    assert.ok(monoRed);
    assert.equal(monoRed.matches, 2);
    assert.equal(monoRed.wins, 1);
    assert.equal(monoRed.losses, 1);
  });

  it('filters by queue', () => {
    const matches = filterMatches(store, {queue: 'ranked_standard'});
    assert.equal(matches.length, 2);
  });

  it('summarizes limited matches', () => {
    const matches = filterMatches(store, {queue: 'event_draft'});
    const rows = summarize(store, matches, ['queue']);
    const draftRow = rows.find((row) => row.key === 'event_draft');
    assert.ok(draftRow);
    assert.equal(draftRow.matches, 1);
    assert.equal(draftRow.winRate, 1);
  });
});
