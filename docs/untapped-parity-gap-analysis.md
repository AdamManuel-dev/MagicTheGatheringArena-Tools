# Untapped parity gap analysis
Purpose: validate Untapped.gg feature parity expectations and document current deviations.

## Live game overlay features
- Parity achieved conceptually via odds:watch and opponent:seen terminal outputs
- Gaps: no graphical overlay, limited color highlighting; planned CLI theming enhancements
- Mitigation: document TTY formatting roadmap and consider OSC 8 hyperlinks for card lookups

## Post-game analytics
- matches:stats and rank:progress planned to mirror ladder and matchup statistics
- Gaps: no built-in visualization yet; rely on CSV/JSON consumers until GA dashboards ship
- Mitigation: provide sample spreadsheet template and recommend integration with Grafana/Observable

## Collection export
- collection:export already aligns with Untapped CSV export capability
- Gaps: no automated cloud sync; rely on manual CLI runs
- Mitigation: schedule future task for optional cron helper or integration with shortcuts

## Limited helpers
- llm:draft and llm:limited-build deliver pick guidance and deck builds via LLMs
- Gaps: missing pick rating numeric scale; rely on textual reasoning and success metrics
- Mitigation: incorporate confidence scores derived from evaluation harness results

## Constructed planning
- llm:brew, llm:rate, llm:matchplan cover brew and sideboard planning needs
- Gaps: no matchup database; relies on user logs only
- Mitigation: encourage players to opt-in to telemetry for richer personal history analytics

## Additional considerations
- Untapped companion includes desktop notifications; CLI roadmap includes optional notify integration
- Untapped offers global meta; explicitly out-of-scope per PRD non-goals
- Stakeholder summary: parity sufficient for Alpha/Beta, with CLI-first UX trade-offs documented
