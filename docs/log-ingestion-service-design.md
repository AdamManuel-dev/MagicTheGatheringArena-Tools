# Log ingestion service design
Purpose: design shared service handling Player.log and player-prev.log rotation.

## Responsibilities
- Locate latest log files (Player.log, player-prev.log) with fallback paths
- Stream GRE events for live features; batch parse for analytics
- Handle file rotation, truncation, and corruption mitigation
- Provide caching and retry strategy for macOS file locks

## Architecture
- Service class with methods `readLatest()`, `streamLive()`, `getSnapshot(range)`
- Use chokidar or FS watch for live updates (with backoff)
- Maintain local cache directory for snapshots with timestamped filenames

## Rotation handling
- Prioritize Player.log; if empty or stale, append player-prev.log preceding most recent session
- Detect rotation via file inode change and reopen file descriptor
- Track last read offset per file to avoid duplication

## Error handling
- On ENOENT: surface actionable error referencing docs
- On EBUSY: retry with exponential backoff up to 5 attempts, then warn user
- On malformed JSON: skip event, log to telemetry (if opted-in)

## APIs for consumers
- Batch mode returns structured array of events filtered by type
- Live mode yields async iterator for streaming commands like odds:watch
- Provide statistics (events processed, dropped, last update time)

## Testing strategy
- Unit tests with mocked FS to simulate rotation and corruption
- Integration tests replaying captured Player.log fixtures
- Performance test ensuring live streaming under 250ms latency per event
