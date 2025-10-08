const {describe, it, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const configModule = require('../../dist/lib/config');

const {
  loadConfigFile,
  saveConfigFile,
  resolveProviderConfig,
  upsertProfile,
} = configModule;

describe('provider config', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'mtga-config-'));
    const configDir = path.join(tempDir, '.mtga-cli');
    process.env.MTGA_CONFIG_DIR = configDir;
    if (fs.existsSync(configDir)) fs.rmSync(configDir, {recursive: true, force: true});
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, {recursive: true, force: true});
    }
    delete process.env.MTGA_CONFIG_DIR;
    delete process.env.MASTRA_PROVIDER;
    delete process.env.MASTRA_MODEL;
    delete process.env.MASTRA_OPENAI_API_KEY;
    delete process.env.MASTRA_TELEMETRY_OPT_IN;
  });

  it('resolves defaults when no config is present', () => {
    const result = resolveProviderConfig({commandName: 'test'});
    assert.equal(result.provider, 'openai');
    assert.equal(result.model, 'gpt-4o-mini');
    assert.equal(result.telemetryOptIn, false);
  });

  it('merges profile configuration and overrides', () => {
    saveConfigFile({
      defaults: {provider: 'anthropic', model: 'claude-3-opus'},
      profiles: {
        ladder: {provider: 'openai', model: 'gpt-4.1'},
      },
    });
    process.env.MASTRA_MODEL = 'gpt-4o-mini';

    const result = resolveProviderConfig({commandName: 'test', profile: 'ladder', providerOverride: 'azure'});
    assert.equal(result.provider, 'azure');
    assert.equal(result.model, 'gpt-4o-mini');
  });

  it('upserts profiles on disk', () => {
    upsertProfile('default', {provider: 'vertex', model: 'gemini-pro'});
    const file = loadConfigFile();
    assert.equal(file.profiles.default.provider, 'vertex');
  });
});
