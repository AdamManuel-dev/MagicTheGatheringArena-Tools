const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

let tempDir;

before(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mtga-mstats-'));
});

after(() => {
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
});

test('matches:stats renders table output', () => {
  const datastorePath = path.join(tempDir, 'datastore.json');
  fs.copyFileSync(path.join(__dirname, '../fixtures/datastore.sample.json'), datastorePath);

  const output = execFileSync('node', [
    path.join(__dirname, '../../bin/run'),
    'matches:stats',
    '--group-by',
    'deck',
    '--datastore',
    datastorePath,
  ], {encoding: 'utf8'});

  assert.ok(output.includes('Mono Red'));
  assert.ok(output.includes('Draft Pod'));
});
