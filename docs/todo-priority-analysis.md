# Todo priority analysis
Purpose: summarize TODO.md priorities, dependencies, and recommended execution batches.

## Priority distribution snapshot (2025-10-08)
- P1: 45 tasks covering rollout strategy, requirements, architecture, security, QA, DevOps
- P2: 29 tasks focused on downstream tooling, analytics, and operational hardening
- P3: 12 tasks targeting GA polish, reporting, and long-term governance

## High-impact dependency nuclei
- Requirements traceability matrix → acceptance criteria → multiple specs, walkthroughs, launch plans
- Mastra scaffolding → log ingestion service → tracing hooks → configuration, retries, analytics APIs
- Scryfall tool wrapper → `--bulk` CLI flag → cache warmup job → legality and monitoring workflows
- Local datastore schemas → delta reconciliation → indexing, migrations, retention, backups
- Security storage & redaction → telemetry opt-in → monitoring/alerts → audit logging

## Proposed execution batches
1. Foundational analysis
   - Construct requirements traceability matrix and command acceptance criteria
   - Deliver edge-case catalog (Player.log availability, infrastructure needs)
   - Finalize alpha rollout gates and hypergeometric odds spec inputs
2. Mastra platform core
   - Upgrade toolchain to Node 20 and scaffold Mastra instance with tracing hooks
   - Implement configuration layer, shared log ingestion, caching/retry for Player.log
   - Deliver Scryfall, Math, Logs tools with secure storage baseline
3. Data and analytics services
   - Model Player.log schemas, build local datastore with delta reconciliation
   - Stand up stats aggregation API, batch analytics pipeline, and writer exporters
   - Produce QA fixtures, targeted unit/integration tests, and regression checklist
4. DevOps and operations hardening
   - Configure CI/CD, packaging workflow, cache warmup job, and telemetry opt-in
   - Layer monitoring/alerts, cache integrity checks, release process, and security reviews
   - Draft operational runbook, disaster recovery drill, and GA retrospective scheduling

## Immediate blockers and prerequisites
- Need authoritative Requirements Traceability Matrix template aligned to AI_FEATURES_PRD.md
- Mastra toolkit version selection pending Node ≥20 upgrade validation
- Sample Player.log corpus required for schema modeling and QA fixtures
- Decision on telemetry data policy required before implementing metrics collection

## Next recommended actions
- Begin Batch 1 by authoring traceability matrix and acceptance criteria documents
- Parallelize toolchain upgrade prep with Mastra package research
- Request or capture anonymized Player.log samples for downstream data tasks
- Draft telemetry privacy policy outline to unblock security and DevOps tracks
