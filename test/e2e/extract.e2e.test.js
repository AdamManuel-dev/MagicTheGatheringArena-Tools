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

test('mtga-collection extract outputs JSON with card quantities', () => {
  const logPath = path.join(tempDir, 'Player.log');
  fs.copyFileSync(path.join(__dirname, '../fixtures/player.log'), logPath);

  const output = execFileSync('node', [
    path.join(__dirname, '../../bin/run'),
    'extract',
    '--no-names',
    '--json',
    '--log',
    logPath,
  ], {encoding: 'utf8'});

  const parsed = JSON.parse(output);
  assert.equal(parsed.count, 2);
  const card123 = parsed.cards.find((c) => c.arena_id === 123);
  assert.ok(card123);
  assert.equal(card123.quantity, 2);
});
