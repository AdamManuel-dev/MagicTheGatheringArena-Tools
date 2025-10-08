# Infrastructure and documentation requirements
Purpose: capture implicit infrastructure and documentation needs supporting CLI features.

## Logging prerequisites
- Document Detailed Logs toggle steps with screenshots reference (future) and CLI reminders
- Provide script and CLI flag defaults for macOS Player.log paths, including alternate accounts
- Explain log rotation behavior and how to supply custom `--log` path when needed

## File system considerations
- Outline required disk space for Scryfall bulk caches and local datastore snapshots
- Detail backup strategy for telemetry and analytics artifacts (opt-in user data)
- Note macOS privacy prompts (Full Disk Access) that may block log reads and provide fixes

## Provider configuration
- Create credential setup guide for OpenAI and optional providers with environment variable table
- Include risk warnings around storing API keys and steps to rotate credentials quickly
- Clarify opt-in model routing defaults and how to override per command

## Documentation deliverables
- Setup guide updates (Node 20 requirement, Detailed Logs, CLI install)
- Troubleshooting section additions (missing Player.log, permissions, iCloud conflicts)
- Provider configuration best practices guide synchronized with security implementation
- Manual regression checklist appendices for QA team consumption

## Operational support
- Define process for distributing anonymized Player.log fixtures internally
- Establish location for telemetry opt-in policy and privacy statement
- Plan for versioned documentation tied to Alpha/Beta/GA stages in release notes
