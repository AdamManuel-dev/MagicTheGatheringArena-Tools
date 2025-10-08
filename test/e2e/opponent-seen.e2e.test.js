const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

let tempDir;

before(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mtga-e2e-'));
});

after(() => {
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
});

test('mtga-collection opponent:seen summarises match data', () => {
  const logPath = path.join(tempDir, 'Match.log');
  fs.copyFileSync(path.join(__dirname, '../fixtures/match.log'), logPath);

  const output = execFileSync('node', [
    path.join(__dirname, '../../bin/run'),
    'opponent:seen',
    '--json',
    '--no-names',
    '--log',
    logPath,
    '--limit',
    '1',
  ], {encoding: 'utf8'});

  const parsed = JSON.parse(output);
  assert.equal(parsed.matches_scanned, 1);
  assert.equal(parsed.cards.length, 1);
  assert.equal(parsed.cards[0].arena_id, 1001);
  assert.equal(parsed.cards[0].seen_count, 1);
});
