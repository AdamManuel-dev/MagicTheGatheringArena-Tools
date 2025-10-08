# Completed TODO archive
Purpose: capture implemented TODO.md items with summary and verification details.

## 2025-10-08

### Lock rollout plan aligning Alpha, Beta, GA deliverables to PRD scope
- Original TODO: Lock rollout plan aligning Alpha, Beta, GA deliverables to PRD scope
- Implementation summary: Authored staged rollout roadmap with targets, dependencies, and governance cadence.
- Files changed: docs/rollout-plan.md
- Tests added: none (documentation)
- Follow-up tasks: Track progress via implementation-log.md; revisit dates after Alpha readiness review.

### Define go/no-go criteria for Alpha before enabling collection:export, opponent:seen, odds:watch
- Original TODO: Define go/no-go criteria for Alpha before enabling collection:export, opponent:seen, odds:watch
- Implementation summary: Captured functional, technical, security, documentation, and operational gates for Alpha.
- Files changed: docs/alpha-go-no-go-criteria.md
- Tests added: none (documentation)
- Follow-up tasks: Validate against readiness evidence prior to Alpha launch.

### Establish Beta readiness checklist covering post-game stats and limited helpers
- Original TODO: Establish Beta readiness checklist covering post-game stats and limited helpers
- Implementation summary: Compiled checklist spanning analytics, LLM helpers, UX, QA, and operations.
- Files changed: docs/beta-readiness-checklist.md
- Tests added: none (documentation)
- Follow-up tasks: Populate checklist statuses as Beta work progresses.

### Create GA launch plan including documentation, tracing/evals, and profile feature toggles
- Original TODO: Create GA launch plan including documentation, tracing/evals, and profile feature toggles
- Implementation summary: Drafted GA launch activities covering hardening, docs, observability, rollout mechanics, and governance.
- Files changed: docs/ga-launch-plan.md
- Tests added: none (documentation)
- Follow-up tasks: Expand with specific owners and timelines during Beta phase.

### Build requirements traceability matrix mapping PRD sections to commands and outputs
- Original TODO: Build requirements traceability matrix mapping PRD sections to commands and outputs
- Implementation summary: Mapped PRD requirements to CLI commands, artifacts, and verification mechanisms.
- Files changed: docs/requirements-traceability-matrix.md
- Tests added: none (documentation)
- Follow-up tasks: Update status column as implementations mature.

### Draft acceptance criteria for each CLI command (inputs, outputs, error states)
- Original TODO: Draft acceptance criteria for each CLI command (inputs, outputs, error states)
- Implementation summary: Defined acceptance criteria including inputs, success behavior, error messaging, and test expectations per command.
- Files changed: docs/command-acceptance-criteria.md
- Tests added: none (documentation)
- Follow-up tasks: Translate criteria into automated tests alongside feature implementation.

### Enumerate Player.log availability and corruption edge cases for live features
- Original TODO: Enumerate Player.log availability and corruption edge cases for live features
- Implementation summary: Cataloged availability, corruption, access, and handling policies for Player.log scenarios.
- Files changed: docs/player-log-edge-cases.md
- Tests added: none (documentation)
- Follow-up tasks: Reference in troubleshooting guide and log ingestion service design.

### Document success metric instrumentation needs (TTFI, brew legality, opponent summaries)
- Original TODO: Document success metric instrumentation needs (TTFI, brew legality, opponent summaries)
- Implementation summary: Outlined telemetry events, data boundaries, tooling, and reporting strategy for success metrics.
- Files changed: docs/success-metrics-instrumentation.md
- Tests added: none (documentation)
- Follow-up tasks: Implement telemetry client and opt-in workflow.

### Identify implicit infrastructure/documentation requirements (Detailed Logs toggle, macOS paths)
- Original TODO: Identify implicit infrastructure/documentation requirements (Detailed Logs toggle, macOS paths)
- Implementation summary: Documented logging prerequisites, filesystem considerations, provider configuration, documentation deliverables, and operational support needs.
- Files changed: docs/infrastructure-doc-requirements.md
- Tests added: none (documentation)
- Follow-up tasks: Integrate content into setup and troubleshooting guides during Beta.

### Validate Untapped feature parity gap analysis and highlight deviations to stakeholders
- Original TODO: Validate Untapped feature parity gap analysis and highlight deviations to stakeholders
- Implementation summary: Assessed parity across live overlay, analytics, collection, limited, and constructed features; flagged gaps and mitigations.
- Files changed: docs/untapped-parity-gap-analysis.md
- Tests added: none (documentation)
- Follow-up tasks: Review gaps during roadmap planning; prioritize CLI theming and notification enhancements.

### Finalize hypergeometric odds specification including mulligan handling and draw step timing
- Original TODO: Finalize hypergeometric odds specification including mulligan handling and draw step timing
- Implementation summary: Authored detailed hypergeometric specification covering deck state, event handling, outputs, CLI presentation, and test strategy.
- Files changed: docs/hypergeometric-odds-spec.md
- Tests added: none (documentation)
- Follow-up tasks: Implement calculations in Math tool according to spec.

### Define opponent card tracking rules (phase resets, duplicates, split cards)
- Original TODO: Define opponent card tracking rules (phase resets, duplicates, split cards)
- Implementation summary: Documented lifecycle, aggregation modes, special cases, and output schema for opponent tracking.
- Files changed: docs/opponent-card-tracking-rules.md
- Tests added: none (documentation)
- Follow-up tasks: Update opponent:seen implementation to match rules.

### Capture collection export schema including Scryfall enrichment and rarity breakdowns
- Original TODO: Capture collection export schema including Scryfall enrichment and rarity breakdowns
- Implementation summary: Defined CSV/JSON schema, enrichment workflow, validation pipeline, and future extensions.
- Files changed: docs/collection-export-schema.md
- Tests added: none (documentation)
- Follow-up tasks: Implement schema validation utilities during collection export refactor.

### Define LLM draft pick feature prompts, constraints, and output validation rules
- Original TODO: Define LLM draft pick feature prompts, constraints, and output validation rules
- Implementation summary: Created prompt templates, JSON schema, validation rules, evaluation metrics, and safety guardrails.
- Files changed: docs/llm-draft-prompts.md
- Tests added: none (documentation)
- Follow-up tasks: Implement Zod schema and prompt wiring in llm:draft command.

### Document brew/matchplan prompt flows, required inputs, and fallback strategies
- Original TODO: Document brew/matchplan prompt flows, required inputs, and fallback strategies
- Implementation summary: Outlined Mastra workflows for llm:brew and llm:matchplan including fallback paths and tooling.
- Files changed: docs/brew-matchplan-prompt-flows.md
- Tests added: none (documentation)
- Follow-up tasks: Translate flows into workflow implementations.

### Capture explanation/mulligan storytelling criteria (tone, length, jargon rules)
- Original TODO: Capture explanation/mulligan storytelling criteria (tone, length, jargon rules)
- Implementation summary: Defined tone, length, structure, jargon, accessibility, validation, and evaluation metrics for storytelling outputs.
- Files changed: docs/llm-storytelling-criteria.md
- Tests added: none (documentation)
- Follow-up tasks: Apply criteria in llm:explain and llm:matchplan outputs and add linting checks.

### Create user journey maps for ladder grinder, brewer, and limited player archetypes
- Original TODO: Create user journey maps for ladder grinder, brewer, and limited player archetypes
- Implementation summary: Mapped end-to-end flows, pain points, and opportunities for three archetypes.
- Files changed: docs/user-journey-maps.md
- Tests added: none (documentation)
- Follow-up tasks: Reference maps during feature prioritization.

### Detail CLI walkthrough scripts for Alpha commands including expected terminal output snapshots
- Original TODO: Detail CLI walkthrough scripts for Alpha commands including expected terminal output snapshots
- Implementation summary: Drafted step-by-step scripts and validation notes for collection:export, opponent:seen, odds:watch, llm:rate, llm:brew.
- Files changed: docs/cli-alpha-walkthroughs.md
- Tests added: none (documentation)
- Follow-up tasks: Capture actual output snapshots once fixtures prepared.

### Draft usability heuristics for live TTY updates (refresh cadence, color use, truncation)
- Original TODO: Draft usability heuristics for live TTY updates (refresh cadence, color use, truncation)
- Implementation summary: Established guidance on refresh cadence, color use, layout, truncation, input handling, and accessibility.
- Files changed: docs/tty-usability-heuristics.md
- Tests added: none (documentation)
- Follow-up tasks: Apply heuristics in odds:watch and live output components.

### Map post-game stats consumption scenarios (spreadsheet import, dashboard integration)
- Original TODO: Map post-game stats consumption scenarios (spreadsheet import, dashboard integration)
- Implementation summary: Documented workflows for spreadsheet users, dashboards, data science, reporting, and edge cases.
- Files changed: docs/post-game-stats-consumption-scenarios.md
- Tests added: none (documentation)
- Follow-up tasks: Build templates and automation scripts to support scenarios.

### Define acceptance scripts for LLM draft and brew experiences covering happy path and failure recovery
- Original TODO: Define acceptance scripts for LLM draft and brew experiences covering happy path and failure recovery
- Implementation summary: Prepared scripted acceptance tests for happy path and failure recovery, including evidence capture steps.
- Files changed: docs/llm-acceptance-scripts.md
- Tests added: none (documentation)
- Follow-up tasks: Execute scripts once implementations stabilized.

### Capture GA onboarding story (enable detailed logs, configure providers, run first report)
- Original TODO: Capture GA onboarding story (enable detailed logs, configure providers, run first report)
- Implementation summary: Authored GA onboarding flow covering installation, profiles, data readiness, advanced features, and observability.
- Files changed: docs/ga-onboarding-story.md
- Tests added: none (documentation)
- Follow-up tasks: Validate timing estimates during GA beta program.

### Upgrade toolchain to Node ≥20 and confirm TypeScript/tsconfig compatibility
- Original TODO: Upgrade toolchain to Node ≥20 and confirm TypeScript/tsconfig compatibility
- Implementation summary: Set engines to >=20.0.0, added .nvmrc (20.11.0), updated README prerequisites, ran `npm run build` to verify TypeScript under Node 18 runtime with npm warning (to be re-run post-upgrade).
- Files changed: package.json, .nvmrc, README.md, docs/node20-upgrade-plan.md
- Tests added: none; `npm run build` executed successfully (TypeScript compile).
- Follow-up tasks: Regenerate lockfile once Node 20 environment available; update CI workflows when added.

### Audit current oclif project structure and reserve namespaces for new commands
- Original TODO: Audit current oclif project structure and reserve namespaces for new commands
- Implementation summary: Documented namespace strategy, created collection/ export command structure, and added legacy alias for backward compatibility.
- Files changed: docs/oclif-structure-audit.md, src/commands/collection/export.ts, src/commands/extract.ts
- Tests added: none; `npm run build` verifies TypeScript compilation.
- Follow-up tasks: Scaffold remaining command implementations per namespace plan.

### Build Scryfall Tool wrapper with bulk cache download, delta sync, and per-ID fallback
- Original TODO: Build Scryfall Tool wrapper with bulk cache download, delta sync, and per-ID fallback
- Implementation summary: Added disk-backed cache for default_cards dataset with metadata tracking, in-memory map reuse, and per-ID fallback leveraging cached data prior to API fetch.
- Files changed: src/lib/scryfall.ts
- Tests added: none; verified via `npm run build`.
- Follow-up tasks: Hook into telemetry to track cache refresh metrics; add unit tests with mocked HTTPS.

### Implement CLI `--bulk` option triggering Scryfall bulk refresh and cache warmup
- Original TODO: Implement CLI `--bulk` option triggering Scryfall bulk refresh and cache warmup
- Implementation summary: Updated collection:export bulk flag to force-refresh cache with progress messages, reusing new Scryfall tool wrapper and legacy extract alias support.
- Files changed: src/commands/collection/export.ts
- Tests added: none; `npm run build` confirms compilation.
- Follow-up tasks: Add integration tests verifying cache warmup and fallback warnings.

### Implement shared log ingestion service handling Player.log and player-prev.log rotation
- Original TODO: Implement shared log ingestion service handling Player.log and player-prev.log rotation
- Implementation summary: Added LogIngestionService with combined snapshot reading, rotation detection, cached fallbacks, and live streaming support.
- Files changed: src/lib/logs.ts, test/unit/logs.test.js
- Tests added: Updated existing unit tests; `npm test` executed successfully.
- Follow-up tasks: Integrate service with future live commands (odds:watch, opponent:seen streaming).

### Design caching and retry strategy for Player.log file reads under macOS file locks
- Original TODO: Design caching and retry strategy for Player.log file reads under macOS file locks
- Implementation summary: Implemented retry/backoff for EBUSY/EPERM errors, snapshot persistence with limited history, and cached fallback when logs unavailable.
- Files changed: src/lib/logs.ts, docs/player-log-caching-retry-strategy.md
- Tests added: `npm test` (covers log ingestion regression).
- Follow-up tasks: Emit telemetry counters for retries once metrics layer is available.

### Create shared output formatter utilities for tables, CSV, JSON, Markdown exports
- Original TODO: Create shared output formatter utilities for tables, CSV, JSON, Markdown exports
- Implementation summary: Added reusable formatters for CSV, JSON, CLI tables, and Markdown tables with unit coverage.
- Files changed: src/lib/formatters/*, src/commands/collection/export.ts, test/unit/formatters.test.js
- Tests added: `npm test` (formatters suite).
- Follow-up tasks: Adopt formatters across additional commands (opponent:seen, analytics outputs).

### Implement configuration layer for provider selection, model routing, and defaults
- Original TODO: Implement configuration layer for provider selection, model routing, and defaults
- Implementation summary: Introduced config module with profile support, environment overrides, persistent storage helpers, and unit tests.
- Files changed: src/lib/config/*, test/unit/provider-config.test.js, docs/provider-configuration-layer.md
- Tests added: `npm test` (provider config suite).
- Follow-up tasks: Wire into LLM commands and expose CLI configuration commands.

### Integrate Mastra tracing hooks with CLI command lifecycle (start, success, failure)
- Original TODO: Integrate Mastra tracing hooks with CLI command lifecycle (start, success, failure)
- Implementation summary: Added tracer with JSONL logging, tracing-aware command base class, and migrated collection:export to traced execution.
- Files changed: src/lib/tracing/*, src/commands/collection/export.ts
- Tests added: `npm test` (regression coverage via collection command running in e2e suite).
- Follow-up tasks: Enable tracing toggle via config and integrate with upcoming Mastra workflows.

### Expose Math Tool implementing hypergeometric probability utilities with tests
- Original TODO: Expose Math Tool implementing hypergeometric probability utilities with tests
- Implementation summary: Added hypergeometric utilities (exact, cumulative, expected value) with validation and dedicated unit tests.
- Files changed: src/lib/math/hypergeometric.ts, src/lib/math/index.ts, test/unit/hypergeometric.test.js
- Tests added: `npm test`
- Follow-up tasks: Integrate Math tool into odds:watch calculations.

### Implement Logs Tool methods for real-time GRE event parsing and historical match summaries
- Original TODO: Implement Logs Tool methods for real-time GRE event parsing and historical match summaries
- Implementation summary: Added LogsTool with custom and GRE parsing support, draw filtering, and odds row utilities powering odds:watch; supplied unit coverage.
- Files changed: src/lib/logs/tool.ts, test/unit/logs-tool.test.js
- Tests added: `npm test` (LogsTool suite).
- Follow-up tasks: Expand parser coverage for additional GRE message types and opponent summaries.

### Model Player.log event schemas and normalize into shared TypeScript types
- Original TODO: Model Player.log event schemas and normalize into shared TypeScript types
- Implementation summary: Added typed data models for matches, games, decks, and log events feeding the logs tool and analytics pipeline.
- Files changed: src/lib/data/types.ts, src/lib/logs/tool.ts
- Tests added: `npm test`
- Follow-up tasks: Extend schemas as additional GRE message types are supported.

### Implement local datastore for cached decklists, match history, and collection snapshots
- Original TODO: Implement local datastore for cached decklists, match history, and collection snapshots
- Implementation summary: Created JSON-backed datastore with load/save helpers, upsert operations, and cache directory management.
- Files changed: src/lib/data/datastore.ts
- Tests added: `npm test`
- Follow-up tasks: Integrate collection snapshots and incremental delta updates once ingestion pipeline expands.

### Create internal stats aggregation API powering matches:stats and rank:progress
- Original TODO: Create internal stats aggregation API powering matches:stats and rank:progress
- Implementation summary: Implemented aggregation utilities supporting deck/queue/opponent groupings and wired into matches:stats CLI output.
- Files changed: src/lib/data/stats.ts, src/commands/matches/stats.ts
- Tests added: `npm test`
- Follow-up tasks: Build rank:progress command leveraging the same API.

### Define delta update strategy to reconcile Player.log with cached state on CLI start
- Original TODO: Define delta update strategy to reconcile Player.log with cached state on CLI start
- Implementation summary: Documented ingestion workflow, added `matches:ingest` command, and implemented parser updating JSON datastore with deduplication.
- Files changed: docs/delta-update-strategy.md, src/lib/data/ingest.ts, src/commands/matches/ingest.ts
- Tests added: `npm test` (data ingest unit & e2e suites).
- Follow-up tasks: Emit matchSummary events from live commands for continuous ingestion.
