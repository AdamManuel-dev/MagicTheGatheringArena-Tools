# Data lifecycle
Purpose: describe how information moves from raw logs to analytics outputs.

## Capture
MTG Arena writes match and collection events to Player.log. The CLI snapshots those files
on demand, preserving a point-in-time view while tagging source paths and byte counts.

## Normalization
Parsers convert textual log messages into typed records:
- Collection parsers map arena IDs to quantities.
- Match parsers build `MatchRecord` objects with nested `GameRecord` entries.
- Odds tooling isolates draw events for hypergeometric updates.

## Storage
Structured data lands in cache directories:
- `cache/data/datastore.json` for matches and decks
- `cache/exports/` for user-requested CSV or JSON
- `cache/tracing/` when tracing is enabled, storing span payloads

## Enrichment
Scryfall lookups augment records with names, sets, and rarity. Bulk mode favors speed by
refreshing cached datasets, whereas per-card lookups prioritize accuracy after new releases.
Tracing captures latency for these enrichment stages when enabled.

## Consumption
Downstream commands reuse normalized data:
- `matches:stats` reads the datastore and applies filters
- `opponent:seen` aggregates opponent cards for CSV or JSON output
- `odds:watch` references deck JSON definitions to interpret draw events

## Retention
Caches persist between runs to accelerate future commands. Users manage retention via
manual cleanup or automation, as described in [Reset caches](../how-to/reset-caches.md).
