# Alpha go/no-go criteria
Purpose: define objective criteria before enabling collection:export, opponent:seen, odds:watch features.

## Functional readiness
- Requirements traceability matrix sections for Alpha commands marked complete
- Acceptance criteria scenarios exercised with fixture logs and manual smoke tests
- Odds:watch renders first update ≤10s across two sample decks

## Technical safeguards
- Mastra scaffolding operational with tracing disabled unless explicitly flagged
- Scryfall Tool bulk cache download validated and checksum recorded
- Log ingestion service handles Player.log rotation and error messaging gracefully

## Security and privacy
- Secure credential storage available (env vars documented, no plaintext secrets)
- Telemetry opt-in prompt implemented but default opt-out for Alpha
- Redaction utility for exports ensures no user identifiers leak by default

## Documentation and support
- Setup guide draft updated for Node 20 requirement and Detailed Logs instructions
- Troubleshooting guide entries for missing Player.log and permissions finalized
- Release notes or changelog entry with known limitations distributed to testers

## Operational checklist
- CI pipeline running lint, tsc --noEmit, and targeted tests on Node 20
- Manual regression checklist executed and signed off by owner
- Rollback plan documented (disable commands via feature toggles if critical issues found)
