# oclif project structure audit
Purpose: document current command namespaces and reserved slots for upcoming features.

## Existing commands (2025-10-08)
- `extract` (collection:export equivalent)
- `opponent:seen`

## Planned namespaces
- `collection:*` → export, stats
- `opponent:*` → seen, watch (future aggregation)
- `odds:*` → watch (live odds)
- `matches:*` → stats (batch analytics)
- `rank:*` → progress tracking
- `llm:*` → rate, brew, explain, matchplan, draft, limited-build
- `metrics:*` → summary, telemetry tools
- `profile:*` → profile management

## Directory recommendations
- `src/commands/collection/export.ts`
- `src/commands/collection/stats.ts`
- `src/commands/odds/watch.ts`
- `src/commands/matches/stats.ts`
- `src/commands/rank/progress.ts`
- `src/commands/llm/{rate,brew,explain,matchplan,draft,limited-build}.ts`
- `src/commands/metrics/summary.ts`
- `src/commands/profile/{init,set}.ts`

## Lib structure
- `src/lib/logs` → ingestion, parsing, caching
- `src/lib/scryfall` → tool wrapper, cache management
- `src/lib/mastra` → agent registry, workflows
- `src/lib/formatters` → table, CSV, Markdown utilities
- `src/lib/config` → provider configuration
- `src/lib/telemetry` → opt-in metrics, tracing integration

## Actions
- Create placeholder index files with TODO comments to avoid import churn later
- Document namespace conventions (snake-case file names, colon command names)
- Update README once additional commands implemented
