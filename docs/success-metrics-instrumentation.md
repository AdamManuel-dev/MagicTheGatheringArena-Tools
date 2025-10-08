# Success metrics instrumentation
Purpose: outline telemetry and instrumentation needs for success metrics defined in AI_FEATURES_PRD.md.

## Metrics overview
- Time-to-first insight (TTFI) for odds:watch startup
- LLM brew legality pass rate for llm:brew outputs
- Opponent:seen validity rate across sessions

## Instrumentation plan
- Emit timestamped lifecycle events (`start`, `first-update`) for odds:watch, measure delta client-side
- Log legality validation results in llm:brew workflow with structured success/failure payloads
- Record opponent:seen session counts with number of matches parsed and error tallies

## Data collection boundaries
- Telemetry opt-in required; default disabled with clear CLI prompt
- Store anonymized hashes for decklists and opponent archetypes; never persist raw card history
- Retain metrics locally with rolling window (e.g., seven days) before optional upload

## Tooling requirements
- Shared telemetry client with batching, backoff, and disk persistence for offline scenarios
- Schema definitions for each event type enforced by TypeScript types
- Integration with tracing/evals pipeline for correlation between Mastra workflows and CLI metrics

## Reporting and monitoring
- Expose CLI command `metrics:summary` for local inspection of recent metrics
- Dashboard hooks (future) in GA to surface adoption, success rates, and anomalies
- Alert thresholds: TTFI > 10s median triggers investigation; legality rate <95% flags brew workflow
