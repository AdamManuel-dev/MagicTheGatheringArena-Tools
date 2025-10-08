# Requirements traceability matrix
Purpose: map AI_FEATURES_PRD.md requirements to CLI commands, outputs, and validation signals.

| PRD section | Requirement snapshot | CLI command(s) | Output/Artifacts | Verification hooks | Status |
|-------------|----------------------|----------------|------------------|--------------------|--------|
| 5.F1        | Live deck odds with Player.log streaming | odds:watch | TTY table, JSON stream | Real-time fixture replay, odds unit tests | Pending |
| 5.F1        | Opponent cards seen per match and aggregate | opponent:seen | Table, CSV/JSON export | Log fixture integration tests | Partial (CLI exists) |
| 5.F2        | Post-game stats (deck, queue, archetype) | matches:stats | CSV/JSON with rollups | Batch analytics pipeline tests | Not started |
| 5.F2        | Ladder progression visualization | rank:progress | CSV/JSON time series | Trend integrity tests, chart smoke | Not started |
| 5.F3        | Collection export with Scryfall enrichment | collection:export | CSV/JSON | Bulk cache validation, per-ID fallback tests | Partial (CLI exists) |
| 5.F3        | Collection stats by set/rarity/color | collection:stats | Table, CSV/JSON | Aggregation unit tests | Not started |
| 5.F4        | Draft pick guidance with explanations | llm:draft | Markdown/JSON rationale | Prompt contract tests, eval scoring | Not started |
| 5.F4        | Limited deck build automation | llm:limited-build | Arena import string, summary | Workflow regression evals | Not started |
| 5.F5        | Constructed brew & rate agents | llm:brew, llm:rate | Markdown/JSON plan | Mastra eval harness | Not started |
| 5.F5        | Mulligan/plan storytelling | llm:explain, llm:matchplan | Markdown narrative | Tone/style lint, eval thresholds | Not started |
| 7.Functional | `--bulk` Scryfall cache path | collection:* commands | Bulk cache file | CLI flag tests, cache checksum | Pending |
| 7.Functional | JSON/CSV/MD outputs for reports | all reporting commands | Multi-format exports | Snapshot-based tests | Pending |
| 7.Non-Functional | Node ≥20 runtime | CLI runtime | Package.json engines | CI Node 20 workflow | Pending |
| 11 | Success metrics (TTFI, legality, opponent summaries) | odds:watch, llm:brew, opponent:seen | Telemetry events | Opt-in metrics pipeline | Pending |
| 9.Rollout | Alpha scope (odds:watch, opponent:seen, collection:export, llm:rate/brew) | listed commands | Release checklist | Rollout governance doc | Drafted |
| 9.Rollout | Beta additions (stats, limited helpers, explain/matchplan) | matches:stats, rank:progress, llm:* | Release notes | Beta readiness checklist | Pending |
| 9.Rollout | GA additions (tracing/evals, profiles) | Telemetry, profile config | Docs, config files | GA launch plan | Pending |
