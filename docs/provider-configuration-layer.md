# Provider configuration layer
Purpose: define configuration layer for provider selection, model routing, defaults.

## Configuration sources
- Environment variables (`MASTRA_PROVIDER`, `MASTRA_MODEL`, API keys)
- Config file (`~/.mtga-cli/config.json`)
- Command-line flags (`--provider`, `--model`, `--profile`)

## Resolution order
1. Config defaults (profile/global)
2. Environment variables
3. CLI flags and explicit overrides

## Features
- Support provider registry with metadata (latency class, max tokens)
- Model routing logic selecting best model per command type
- Failover to backup provider on error threshold

## API surface
- `getProviderConfig(commandName)` returning provider, model, options
- `setConfig(key, value)` for config CLI command
- `resolveSecret(key)` to fetch from keychain or env

## Security
- Never store API keys in plaintext files without encryption; use macOS Keychain integration where possible
- Provide `config:rotate` command to update credentials safely

## Testing
- Unit tests for resolution order and flag overrides
- Integration tests simulating missing credentials and failover
