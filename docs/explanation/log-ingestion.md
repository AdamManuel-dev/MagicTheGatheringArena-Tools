# Log ingestion
Purpose: explain how the CLI discovers, reads, and snapshots MTG Arena logs.

## Discovery strategy
`LogIngestionService` checks the macOS log directory and optional overrides, prioritizing
`Player.log` and `player-prev.log`. Candidates are read sequentially so the newest content
appears first while still preserving rotated history.

## Snapshot lifecycle
Each successful read persists a snapshot under `cache/logs/snapshots/` and records metadata
in `cache/logs/latest.json`. The service keeps the last five snapshots, removing older ones
to balance reproducibility and disk usage. Cached snapshots serve offline commands when the
live log becomes unavailable.

## Concurrency safeguards
Arena can lock Player.log while writing. Read attempts retry with progressive delays
(250 ms through 4 s) to avoid noisy errors. When retries fail, the service falls back to the
most recent cached snapshot, marking the result as `fromCache` for downstream consumers.

## Data flow to commands
- `collection:export` requests a combined snapshot and passes the raw text to collection
  parsers.
- `opponent:seen` uses `readMatchLogs` to merge match events while preserving timestamps.
- `odds:watch` streams new log chunks using the service’s async iterator for low-latency
  updates.

## Trade-offs
- Limiting snapshots avoids disk bloat but reduces deep history; users can archive the
  directory manually when long-term retention is required.
- The reader assumes macOS paths, simplifying support but leaving Windows unaddressed.
