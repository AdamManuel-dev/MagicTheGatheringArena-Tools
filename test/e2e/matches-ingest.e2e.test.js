const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

let tempDir;

before(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mtga-mingest-'));
});

after(() => {
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
});

test('matches:ingest updates datastore from log', () => {
  const datastorePath = path.join(tempDir, 'datastore.json');
  fs.copyFileSync(path.join(__dirname, '../fixtures/datastore.sample.json'), datastorePath);
  const logPath = path.join(__dirname, '../fixtures/logs/match-summary.log');

  const output = execFileSync('node', [
    path.join(__dirname, '../../bin/run'),
    'matches:ingest',
    '--log',
    logPath,
    '--datastore',
    datastorePath,
  ], {encoding: 'utf8'});

  assert.ok(output.includes('Ingested'));
  const storeRaw = fs.readFileSync(datastorePath, 'utf8');
  const store = JSON.parse(storeRaw);
  const ingested = store.matches.find((match) => match.matchId === 'm10');
  assert.ok(ingested);
});
