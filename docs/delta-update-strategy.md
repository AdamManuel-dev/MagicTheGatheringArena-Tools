# Delta update strategy
Purpose: reconcile Player.log data with the local datastore when commands start.

## Overview
- `matches:ingest` reads the latest Player.log snapshot and extracts `matchSummary` events.
- Ingested matches are merged into `cache/data/datastore.json` using ID-based upserts.
- Subsequent analytics commands (matches:stats, rank:progress) use the datastore instead of raw logs.

## Workflow
1. Invoke `matches:ingest` before running analytics commands.
2. The ingest job scans the log for JSON entries containing `event: "matchSummary"`.
3. New matches are deduplicated by `matchId` and appended to the datastore.
4. Datastore metadata (`updatedAt`) records the last update timestamp for audit.

## Log emission expectations
- Commands that produce match summaries (future odds/match trackers) should write JSON objects with:
  - `matchId`, `queue`, `deckId`/`deckName`, `startedAt`, `result`.
  - Optional `games` array with per-game results for deeper analytics.
- Additional metadata (e.g., deck archetype classification) can be included for downstream tooling.

## Error handling
- Missing or malformed JSON lines are ignored to ensure ingestion is resilient.
- Datastore writes occur atomically by writing to disk only after successful parse.
- Re-running ingestion is idempotent because matches are keyed by `matchId`.

## Next steps
- Emit `matchSummary` events from live commands (opponent:seen, odds:watch, future workflows).
- Extend ingestion to capture rank progression events for `rank:progress`.
- Persist last processed timestamp to support incremental log scans if needed.
