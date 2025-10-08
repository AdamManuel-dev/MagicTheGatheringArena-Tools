# Command acceptance criteria
Purpose: define acceptance criteria for CLI commands, covering inputs, outputs, and error handling.

## collection:export
- Inputs: default Player.log path; flags `--json`, `--no-names`, `--bulk`, `--log`, `--out`
- Acceptance: produces CSV (default) or JSON with arena_id + enrichment when Detailed Logs enabled
- Errors: missing log → fatal error with guidance; empty owned map → instruct to enable Detailed Logs
- Tests: unit tests for log parsing, bulk fallback; CLI smoke with fixture logs

## collection:stats
- Inputs: same as `collection:export`, adds `--group-by` (set|rarity|color)
- Acceptance: CSV/JSON tables summarizing counts per grouping; totals match export quantities
- Errors: unknown group → validation error; missing logs same as export
- Tests: aggregation unit tests, CLI snapshot comparisons for fixture

## opponent:seen
- Inputs: flags `--json`, `--limit`, `--group-by`, `--since`, `--from`, `--to`, `--out`
- Acceptance: default per-match table; optional aggregated view when `--group-by card`
- Errors: invalid date range → descriptive error; missing match logs → actionable warning
- Tests: integration tests replaying Player.log fixture; JSON schema validation

## odds:watch
- Inputs: flags `--deck`, `--match-id`, `--json`, `--trace`
- Acceptance: renders initial state within 10s, updates after relevant GRE events, exposes JSON stream when requested
- Errors: decklist mismatch → prompt to refresh; file lock issues → retry with warning
- Tests: streaming harness with replayed GRE events; hypergeometric unit tests

## matches:stats
- Inputs: flags `--json`, `--queue`, `--deck`, `--since`, `--from`, `--to`, `--out`
- Acceptance: aggregated stats per deck/queue/archetype with sample size columns
- Errors: insufficient games → caution message but still output; missing data → instruct to run collection
- Tests: aggregation correctness via fixture; CLI snapshot for CSV

## rank:progress
- Inputs: flags `--json`, `--window`, `--since`, `--from`, `--to`, `--out`
- Acceptance: chronological rank ladder progression with change deltas and metadata
- Errors: inconsistent rank events → highlight anomalies; no rank events → guidance to enable logs
- Tests: time series reconstruction tests; CLI snapshot

## llm:rate / llm:brew
- Inputs: decklist, constraints flags (`--format`, `--budget`, `--provider`, `--model`, `--trace`)
- Acceptance: JSON/Markdown outputs with recommendations passing legality/tool validations
- Errors: provider misconfig → prompt to configure credentials; invalid decklist → error with actionable hint
- Tests: Mastra workflow eval harness with golden responses; prompt contract unit tests

## llm:explain / llm:matchplan
- Inputs: recent match log reference, flags for output length, tone, provider, model
- Acceptance: narratives respect tone/length guidance and include actionable steps
- Errors: missing log reference → instruct to run matches:stats; provider error → surface with retry instructions
- Tests: evaluation harness enforcing tone, structured outlines; CLI smoke with sample inputs

## llm:draft / llm:limited-build
- Inputs: draft pick context or pool, flags for format, provider, constraints
- Acceptance: outputs include pick ranking, justification, or decklist with curve/land checks
- Errors: incomplete pool → prompt user; API failure → retry/backoff message
- Tests: prompt contract tests, evaluation metrics for legality and curve integrity

## Helper services
- Scryfall tool: ensures bulk cache freshness and fallback per-ID lookups with retries
- Logs tool: resilient to file rotation, handles player-prev.log, exposes structured events
- Math tool: validates hypergeometric calculations with known scenarios
- Writer tool: outputs Arena import strings, CSV, Markdown templates with schema validation
