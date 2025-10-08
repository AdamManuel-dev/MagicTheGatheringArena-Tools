# Player.log caching and retry strategy
Purpose: design caching and retry behavior for Player.log reads under macOS file locks.

## Caching
- Maintain memory cache of last 1,000 events for live commands to reduce reparse costs
- Persist snapshot file per session (`cache/log-snapshot-<timestamp>.json`)
- Invalidate cache after 15 minutes of inactivity or when file inode changes

## Retry policy
- On file lock (EBUSY): attempt up to 5 retries with exponential backoff (250ms, 500ms, 1s, 2s, 4s)
- On partial read (shorter than expected): retry once after 100ms before considering log truncated
- Provide progress feedback to user after second retry

## Graceful degradation
- If retries exhausted, surface message: "Player.log busy; re-run after closing Arena or wait 5s"
- Offer `--retry-ms` flag for advanced users to customize backoff

## Telemetry
- Increment counters for retries, failures (opt-in)
- Record time spent waiting to inform future tuning

## Testing
- Mock file lock scenarios using child process locking file
- Ensure retries do not exceed 10 seconds total by default
