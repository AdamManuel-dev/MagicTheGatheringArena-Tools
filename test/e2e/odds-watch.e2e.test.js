const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

let tempDir;

before(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mtga-odds-e2e-'));
});

after(() => {
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
});

test('odds:watch replay outputs tracked odds table', () => {
  const logPath = path.join(tempDir, 'Player.log');
  fs.copyFileSync(path.join(__dirname, '../fixtures/logs/draw-sequence.log'), logPath);

  const output = execFileSync('node', [
    path.join(__dirname, '../../bin/run'),
    'odds:watch',
    '--deck',
    path.join(__dirname, '../fixtures/decks/mono-red.json'),
    '--log',
    logPath,
    '--replay',
  ], {encoding: 'utf8'});

  assert.ok(output.includes('Lightning Bolt'));
  assert.ok(output.includes('Lands'));
  assert.ok(output.includes('Library size'));
});
