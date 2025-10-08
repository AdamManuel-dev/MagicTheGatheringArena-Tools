# Architecture
Purpose: explain why the MTG Arena CLI operates as a log-driven TypeScript toolchain.

## High-level system
The CLI reads rotating MTG Arena Player.log files, extracts card or match events, enriches
records with Scryfall data, and emits CSV or JSON outputs. Commands share tracing,
configuration, and formatting utilities under `src/lib` to keep behaviors consistent.

## Why oclif and TypeScript
TypeScript provides static guarantees across file parsing utilities that manipulate JSON
payloads from Arena logs. The oclif framework supplies structured flag parsing, error
handling, and help text, which shortens feature delivery when new commands join the suite.

## Log ingestion pipeline
`LogIngestionService` normalizes access to Player.log and player-prev.log, handles file
locks with exponential backoff, and persists snapshots under `cache/logs`. Downstream
functions such as `extractOwnedFromLog` and `parseMatches` operate on these snapshots,
ensuring deterministic inputs during testing and replay scenarios.

## Data enrichment and caching
Scryfall lookups run in two modes: per-card requests for accuracy on fresh releases and a
bulk cache refreshed on demand for high-throughput exports. Cached data lives under
`cache/scryfall` (created lazily) so repeated runs avoid redundant network calls while still
allowing manual refresh via the `--bulk` flag when necessary.

## Derived analytics
Match ingest and stats commands separate acquisition from aggregation. `matches:ingest`
produces a datastore JSON keyed by match identifiers, while `matches:stats` composes
filters and grouping dimensions over that datastore. This separation enables incremental
updates and avoids recomputing aggregates from raw logs on every invocation.

## Live odds monitoring
`odds:watch` streams Player.log changes through `LogIngestionService.streamLive`, feeding a
hypergeometric model that estimates draw probabilities per tracked group. Structured deck
files allow reusable tracking profiles across events or archetypes without editing source.

## Trade-offs
- Accepts macOS-only paths to simplify Player.log discovery, trading portability for a
  controlled support surface.
- Prefers local snapshots over direct streaming to provide reproducible debugging artifacts
  at the cost of additional disk usage under `cache/logs`.
- Uses Scryfall bulk data for speed, which can trail the live API by several hours when new
  cards release.

## Future considerations
Potential expansions include Windows log path support, delta-based datastore updates to
reduce JSON rewrite overhead, and optional telemetry for performance diagnostics once
privacy safeguards mature.
