# Beta readiness checklist
Purpose: confirm post-game analytics and limited helpers meet requirements before Beta release.

## Data and analytics
- [ ] Batch analytics pipeline parsing Player.log snapshots into normalized datastore
- [ ] matches:stats aggregation accuracy validated against fixture set
- [ ] rank:progress time series validated for rank boundary transitions
- [ ] Data retention and pruning utilities configured with tests

## Limited and LLM helpers
- [ ] llm:draft prompts tuned with evaluation harness covering happy and failure paths
- [ ] llm:limited-build outputs pass legality, curve, and land ratio checks automatically
- [ ] Writer Tool exports Arena import strings for draft builds with schema validation
- [ ] Legality Tool enforces format rules, singleton, and color identity constraints

## User experience
- [ ] CLI walkthrough scripts updated with expected outputs for new commands
- [ ] Usability heuristics documented for live TTY updates and long-running workflows
- [ ] Analytics usage guide draft includes visualization instructions and examples
- [ ] Provider configuration best practices published with Beta notes

## Quality assurance
- [ ] Integration tests simulating live match flows for odds:watch and opponent:seen expanded
- [ ] Automated regression suite covers batch reports (matches:stats, rank:progress)
- [ ] Evaluation harness for Mastra workflows gated with pass thresholds per success metric
- [ ] Code review checklist updated to emphasize security, logging, and UX criteria

## Operations and telemetry
- [ ] Telemetry opt-in workflow launched with anonymized metrics storage
- [ ] Monitoring/alerts configured for CLI errors, agent failures, data freshness
- [ ] Scheduled cache integrity job in place for Scryfall bulk dataset
- [ ] Release channel process (alpha, beta, stable) documented with changelog automation
