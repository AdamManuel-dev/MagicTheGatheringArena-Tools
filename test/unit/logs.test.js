const {describe, it, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const logs = require('../../dist/lib/logs.js');

const {extractOwnedFromLog, readBestLog, defaultLogs} = logs;

describe('logs utilities', () => {
  let tempDir;
  let savedDefaultLogs;

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mtga-logs-'));
    savedDefaultLogs = [...defaultLogs];
  });

  after(() => {
    if (savedDefaultLogs) {
      defaultLogs.length = 0;
      defaultLogs.push(...savedDefaultLogs);
    }
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, {recursive: true, force: true});
    }
  });

  it('extractOwnedFromLog parses InventoryInfo payloads', () => {
    const log = 'InventoryInfo payload {"cards":[{"cardId":123,"quantity":4},{"cardId":456,"quantity":2}]}';
    const owned = extractOwnedFromLog(log);

    assert.equal(owned.size, 2);
    assert.equal(owned.get(123), 4);
    assert.equal(owned.get(456), 2);
  });

  it('extractOwnedFromLog uses regex fallback when JSON is missing', () => {
    const log = 'noise "cardId":789,"quantity":3 filler "cardId":789,"quantity":1';
    const owned = extractOwnedFromLog(log);

    assert.equal(owned.size, 1);
    assert.equal(owned.get(789), 3);
  });

  it('readBestLog prefers the longest available file from defaults', () => {
    const shortPath = path.join(tempDir, 'short.log');
    const longPath = path.join(tempDir, 'long.log');
    fs.writeFileSync(shortPath, 'tiny', 'utf8');
    fs.writeFileSync(longPath, 'this one is longer', 'utf8');

    defaultLogs.length = 0;
    defaultLogs.push(shortPath, longPath);

    const result = readBestLog();
    assert.equal(result.path, longPath);
    assert.equal(result.text, 'this one is longer');
  });
});
