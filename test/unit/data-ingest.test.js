const {describe, it} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const {parseMatchSummaries, ingestMatches} = require('../../dist/lib/data/ingest');
const {loadDataStore} = require('../../dist/lib/data/datastore');

describe('data ingest', () => {
  it('parses match summaries from log text', () => {
    const text = fs.readFileSync(path.join(__dirname, '../fixtures/logs/match-summary.log'), 'utf8');
    const matches = parseMatchSummaries(text);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].matchId, 'm10');
    assert.equal(matches[0].games.length, 3);
  });

  it('ingests matches into datastore', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mtga-ingest-'));
    const datastorePath = path.join(tempDir, 'datastore.json');
    fs.copyFileSync(path.join(__dirname, '../fixtures/datastore.sample.json'), datastorePath);

    await ingestMatches({logPath: path.join(__dirname, '../fixtures/logs/match-summary.log'), datastorePath});
    const store = loadDataStore(datastorePath);
    const ingested = store.matches.find((match) => match.matchId === 'm10');
    assert.ok(ingested);
    fs.rmSync(tempDir, {recursive: true, force: true});
  });
});
