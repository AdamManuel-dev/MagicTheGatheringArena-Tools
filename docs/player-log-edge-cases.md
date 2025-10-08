# Player.log edge cases
Purpose: catalog Player.log availability and corruption scenarios affecting live and batch features.

## Availability scenarios
- Fresh install without Detailed Logs enabled → no GRE events; block odds and opponent tracking with guidance
- Alternate macOS user account → Player.log path absent; show precise path and permission instructions
- MTGA update resets log path → detect via missing directory and prompt to relaunch Arena once
- Log rotation to player-prev.log only → merge latest rotated file to avoid empty session

## Corruption cases
- Truncated file due to crash → warn and fall back to previous backup snapshot
- Non-UTF8 characters injected by plugins → sanitize with safe decoding and skip offending lines
- Partial JSON payloads for GRE events → retry parse with buffer or skip event with telemetry flag
- Duplicate session headers → deduplicate before aggregation to avoid double counting

## File lock / access
- Arena running during read → implement exponential backoff with user-facing status
- Spotlight/iCloud syncing the log directory → detect ENOENT vs EBUSY and provide resolution tips
- Permission denied after restore from backup → guidance to run `chmod` on log directory

## Edge-case handling policy
- Always emit actionable CLI warnings pointing to troubleshooting doc section
- Capture structured telemetry flag (if opted-in) when skipping corrupted events
- Maintain last-good snapshot in local datastore with timestamp and hash
- Document manual recovery steps in troubleshooting guide
