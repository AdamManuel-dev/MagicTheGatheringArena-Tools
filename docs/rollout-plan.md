# Rollout plan
Purpose: align Alpha, Beta, and GA deliverables with AI_FEATURES_PRD scope and dependencies.

## Alpha (target: 2025-11-15)
- Deliver collection:export enhancements (bulk cache, JSON output polish)
- Ship opponent:seen parity with aggregation and CSV/JSON export
- Launch odds:watch MVP with hypergeometric odds and opponent deck state
- Enable llm:rate and llm:brew workflows via Mastra with baseline prompts
- Prerequisites: requirements traceability matrix, acceptance criteria, Mastra scaffolding
- Exit criteria: go/no-go checklist satisfied, telemetry opt-in disabled by default

## Beta (target: 2026-01-10)
- Add matches:stats and rank:progress reporting commands with datastore backing
- Release llm:matchplan, llm:explain, llm:draft, and llm:limited-build workflows
- Provide limited helpers with validation (legality, curve, story tone)
- Harden local datastore (delta reconciliation, indexing) and batch analytics pipeline
- Prerequisites: Alpha retrospective, beta readiness checklist approvals, QA fixtures assembled
- Exit criteria: telemetry opt-in launched with privacy docs, CI/CD pipeline green for Node 20

## GA (target: 2026-03-15)
- Activate tracing/evals dashboards, profile management subsystem, and provider configuration UI
- Publish full documentation suite (setup, troubleshooting, analytics guide, LLM handbook)
- Implement monitoring/alerts, release channel automation, disaster recovery drills
- Prerequisites: beta metrics trending positive, security review complete, operational runbook drafted
- Exit criteria: GA launch plan tasks completed, opt-in telemetry stable, support process staffed

## Cross-stage governance
- Bi-weekly readiness review meetings to assess checklist progress and blockers
- Maintain implementation-log.md for traceability and update TODO.md status after each milestone
- Archive completed TODOs into COMPLETED_TODOS.md with summary and verification evidence
