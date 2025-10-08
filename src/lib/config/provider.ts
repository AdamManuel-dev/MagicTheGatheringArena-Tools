import fs from 'fs';
import os from 'os';
import path from 'path';

export type ProfileConfig = {
  provider?: string;
  model?: string;
  telemetryOptIn?: boolean;
};

export type ConfigFile = {
  defaults?: ProfileConfig;
  profiles?: Record<string, ProfileConfig>;
};

export type ProviderResolutionInput = {
  commandName: string;
  profile?: string;
  providerOverride?: string;
  modelOverride?: string;
};

export type ResolvedProviderConfig = {
  provider: string;
  model: string;
  apiKey?: string;
  telemetryOptIn: boolean;
  profile?: string;
};

function getConfigDir(): string {
  const override = process.env.MTGA_CONFIG_DIR;
  if (override) return override;
  return path.join(os.homedir(), '.mtga-cli');
}

function getConfigFile(): string {
  return path.join(getConfigDir(), 'config.json');
}

function ensureConfigDir(): void {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
}

export function loadConfigFile(): ConfigFile {
  try {
    const raw = fs.readFileSync(getConfigFile(), 'utf8');
    return JSON.parse(raw) as ConfigFile;
  } catch {
    return {};
  }
}

export function saveConfigFile(config: ConfigFile): void {
  ensureConfigDir();
  fs.writeFileSync(getConfigFile(), JSON.stringify(config, null, 2), 'utf8');
}

function resolveProfile(config: ConfigFile, profileName?: string): ProfileConfig {
  if (!profileName) return config.defaults ?? {};
  const profile = config.profiles?.[profileName];
  return {...(config.defaults ?? {}), ...(profile ?? {})};
}

function resolveEnv(): ProfileConfig {
  const provider = process.env.MASTRA_PROVIDER ?? process.env.OPENAI_API_TYPE;
  const model = process.env.MASTRA_MODEL ?? process.env.OPENAI_MODEL;
  const telemetry = process.env.MASTRA_TELEMETRY_OPT_IN;
  return {
    provider: provider ?? undefined,
    model: model ?? undefined,
    telemetryOptIn: telemetry ? telemetry === '1' || telemetry.toLowerCase() === 'true' : undefined,
  };
}

function resolveApiKey(provider: string | undefined): string | undefined {
  if (provider && provider.toLowerCase().includes('openai')) {
    return process.env.MASTRA_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
  }
  return process.env.MASTRA_API_KEY ?? undefined;
}

export function resolveProviderConfig(input: ProviderResolutionInput): ResolvedProviderConfig {
  const config = loadConfigFile();
  const profile = resolveProfile(config, input.profile);
  const env = resolveEnv();

  const provider = input.providerOverride ?? env.provider ?? profile.provider ?? 'openai';
  const model = input.modelOverride ?? env.model ?? profile.model ?? 'gpt-4o-mini';
  const telemetryOptIn = input.profile
    ? profile.telemetryOptIn ?? env.telemetryOptIn ?? false
    : env.telemetryOptIn ?? profile.telemetryOptIn ?? false;

  return {
    provider,
    model,
    apiKey: resolveApiKey(provider),
    telemetryOptIn,
    profile: input.profile,
  };
}

export function upsertProfile(name: string, updates: ProfileConfig): ConfigFile {
  const config = loadConfigFile();
  ensureConfigDir();
  const profiles = config.profiles ?? {};
  profiles[name] = {...(profiles[name] ?? {}), ...updates};
  const next: ConfigFile = {...config, profiles};
  saveConfigFile(next);
  return next;
}
