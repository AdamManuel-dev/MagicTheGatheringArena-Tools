# Mastra scaffolding plan
Purpose: describe scaffolding for Mastra instance with agent registry, tool bindings, config hooks.

## Components
- `mastra/index.ts` exporting configured `MastraClient`
- Agent registry mapping names to prompt/workflow definitions
- Tool bindings for Logs, Scryfall, Math, Legality, Writer
- Configuration hooks reading provider defaults and feature flags

## Initialization flow
1. Load config from `mastra.config.json` or environment variables
2. Instantiate shared tools with dependencies (e.g., Scryfall cache path)
3. Register agents with workflows and success criteria
4. Expose helper to execute workflow with tracing toggle

## Developer ergonomics
- Provide `mastra/dev-server.ts` for local playground
- Document `npm run mastra:dev` command to launch playground
- Include typed interfaces for agent IO using Zod

## Testing
- Unit tests mocking Mastra client responses
- Integration tests verifying workflows with stubbed tools
- Snapshot prompts to detect unintended changes

## Security considerations
- Ensure secrets loaded via environment, not checked into repo
- Allow per-agent provider overrides with whitelist

## Next steps
- Evaluate Mastra version compatibility with Node 20
- Define default agent list and exposures for CLI commands
