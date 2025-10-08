# Automation philosophy
Purpose: outline the principles guiding scheduled jobs and scripting support.

## Safety first
Automation recommendations favor idempotent commands that can rerun without data loss.
Exports write to cache directories, leaving source logs untouched. Commands emit non-zero
exit codes so schedulers detect failures rather than masking them.

## Transparency
Logs route to `/tmp/` files or standard output to keep audit trails accessible. When
automation wraps `collection:export`, documentation pairs the job with validation checks so
users notice missing data promptly.

## Minimal configuration
Schedules reference project-relative paths and rely on environment variables sparingly.
This keeps automation portable across machines and avoids exposing secrets in crontabs or
launch agents. Profiles remain opt-in for advanced scenarios.

## Observability hooks
Tracing stays disabled by default but can be toggled via `MTGA_COLLECTION_TRACE=1` during
investigations. Automation guidance encourages short-lived spans and cache cleanup to
maintain signal quality.

## Evolution
Future automation may integrate with CI runners or cloud schedulers. The guiding principle
remains: scripts should mirror manual commands documented elsewhere, ensuring parity between
ad-hoc usage and unattended execution.
