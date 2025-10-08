# TODO implementation log
Purpose: track status and evidence for each TODO.md item during this session.

| Task | Status | Files Changed | Tests Added | Notes |
|------|--------|---------------|-------------|-------|
| Lock rollout plan (Alpha→GA) | Done 2025-10-08 | docs/rollout-plan.md | n/a | Targets set for 2025-11-15, 2026-01-10, 2026-03-15 |
| Alpha go/no-go criteria | Done 2025-10-08 | docs/alpha-go-no-go-criteria.md | n/a | Includes functional, technical, security, docs, ops gates |
| Beta readiness checklist | Done 2025-10-08 | docs/beta-readiness-checklist.md | n/a | Checklist spans analytics, LLM, UX, QA, ops |
| GA launch plan | Done 2025-10-08 | docs/ga-launch-plan.md | n/a | Covers hardening, docs, observability, rollout |
| Requirements traceability matrix | Done 2025-10-08 | docs/requirements-traceability-matrix.md | n/a | Maps PRD sections to commands and verification hooks |
| Command acceptance criteria | Done 2025-10-08 | docs/command-acceptance-criteria.md | n/a | Defines inputs, outputs, errors for each CLI command |
| Player.log edge cases | Done 2025-10-08 | docs/player-log-edge-cases.md | n/a | Catalogs availability, corruption, lock scenarios |
| Success metrics instrumentation | Done 2025-10-08 | docs/success-metrics-instrumentation.md | n/a | Telemetry plan for TTFI, legality, opponent summary rates |
| Infrastructure/documentation requirements | Done 2025-10-08 | docs/infrastructure-doc-requirements.md | n/a | Captures implicit setup, provider, ops documentation |
| Untapped parity gap analysis | Done 2025-10-08 | docs/untapped-parity-gap-analysis.md | n/a | Highlights CLI parity gaps and mitigations |
| Hypergeometric odds spec | Done 2025-10-08 | docs/hypergeometric-odds-spec.md | n/a | Covers deck state, events, outputs, tests |
| Opponent tracking rules | Done 2025-10-08 | docs/opponent-card-tracking-rules.md | n/a | Defines lifecycle, aggregation, edge cases |
| Collection export schema | Done 2025-10-08 | docs/collection-export-schema.md | n/a | CSV/JSON schema and enrichment workflow |
| LLM draft prompts | Done 2025-10-08 | docs/llm-draft-prompts.md | n/a | Prompt templates, schema, evaluation metrics |
| Brew/matchplan prompt flows | Done 2025-10-08 | docs/brew-matchplan-prompt-flows.md | n/a | Workflow stages and fallbacks |
| LLM storytelling criteria | Done 2025-10-08 | docs/llm-storytelling-criteria.md | n/a | Tone, length, accessibility guidelines |
| User journey maps | Done 2025-10-08 | docs/user-journey-maps.md | n/a | Flows for ladder, brewer, limited archetypes |
| CLI walkthrough scripts | Done 2025-10-08 | docs/cli-alpha-walkthroughs.md | n/a | Step-by-step commands and expectations |
| TTY usability heuristics | Done 2025-10-08 | docs/tty-usability-heuristics.md | n/a | Refresh cadence, layout, accessibility |
| Post-game stats scenarios | Done 2025-10-08 | docs/post-game-stats-consumption-scenarios.md | n/a | Spreadsheet, dashboard, reporting flows |
| LLM acceptance scripts | Done 2025-10-08 | docs/llm-acceptance-scripts.md | n/a | Happy path and failure recovery steps |
| GA onboarding story | Done 2025-10-08 | docs/ga-onboarding-story.md | n/a | End-to-end onboarding narrative |
| Node ≥20 upgrade | Done 2025-10-08 | package.json, .nvmrc, README.md, docs/node20-upgrade-plan.md | n/a | Engines bumped, Node 20 documented, build run |
| oclif structure audit | Done 2025-10-08 | docs/oclif-structure-audit.md, src/commands/collection/export.ts, src/commands/extract.ts | n/a | Reserved namespaces and replatformed collection command |
| Scryfall tool wrapper | Done 2025-10-08 | src/lib/scryfall.ts | n/a | Added cached bulk dataset with delta sync and fallback |
| collection --bulk warmup | Done 2025-10-08 | src/commands/collection/export.ts | n/a | Bulk flag now refreshes cache and logs progress |
| Log ingestion service | Done 2025-10-08 | src/lib/logs.ts, test/unit/logs.test.js | npm test | Added rotation-aware ingestion with caching and streaming |
| Log retry/caching strategy | Done 2025-10-08 | src/lib/logs.ts, docs/player-log-caching-retry-strategy.md | npm test | Implemented backoff and snapshot persistence |
| Formatter utilities | Done 2025-10-08 | src/lib/formatters, src/commands/collection/export.ts, test/unit/formatters.test.js | npm test | Added shared CSV/JSON/table/Markdown formatters |
| Provider config layer | Done 2025-10-08 | src/lib/config, test/unit/provider-config.test.js, docs/provider-configuration-layer.md | npm test | Profile-aware provider resolution with env/override support |
| Tracing base class | Done 2025-10-08 | src/lib/tracing, src/commands/collection/export.ts | npm test | Added tracer events and traced command base |
| Math tool hypergeometric | Done 2025-10-08 | src/lib/math, test/unit/hypergeometric.test.js | npm test | Added hypergeometric utilities and unit coverage |
| Logs tool parser | Done 2025-10-08 | src/lib/logs/tool.ts, test/unit/logs-tool.test.js | npm test | Added GRE/custom draw parsing and odds helpers |
| odds:watch command | Done 2025-10-08 | src/commands/odds/watch.ts, test/e2e/odds-watch.e2e.test.js, fixtures | npm test | Live odds replay command using log ingestion and math tool |
| Player.log data types | Done 2025-10-08 | src/lib/data/types.ts, src/lib/logs/tool.ts | npm test | Defined match/game schemas feeding analytics |
| Local datastore | Done 2025-10-08 | src/lib/data/datastore.ts | npm test | JSON-backed datastore with upsert helpers |
| matches:stats command | Done 2025-10-08 | src/commands/matches/stats.ts, src/lib/data/stats.ts, test/e2e/matches-stats.e2e.test.js | npm test | Aggregated stats output with filters and formats |
| Delta ingest strategy | Done 2025-10-08 | docs/delta-update-strategy.md, src/lib/data/ingest.ts, src/commands/matches/ingest.ts | npm test | Added matchSummary parser and ingestion command with datastore dedupe |
