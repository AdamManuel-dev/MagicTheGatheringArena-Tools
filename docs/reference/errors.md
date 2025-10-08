# Error catalog
Purpose: list notable error messages and their causes.

## Could not read Player.log
- Trigger: `collection:export`, `opponent:seen`, `matches:ingest`
- Cause: Player.log missing, Detailed Logs disabled, or permission denied
- Resolution: enable logs, open Arena, or pass `--log /custom/path`

## No owned cards found in the log
- Trigger: `collection:export`
- Cause: Detailed Logs enabled but collection not viewed this session
- Resolution: open the Collection screen after restarting Arena

## No matches found matching the specified filters
- Trigger: `opponent:seen`
- Cause: Time window, opponent filter, or include list removes all matches
- Resolution: broaden `--since`, drop filters, or confirm recent matches exist

## Bulk load failed
- Trigger: commands using `--bulk`
- Cause: network failure or stale cache directory
- Resolution: rerun without `--bulk` or clear `cache/scryfall`

## Exit status 1
- Trigger: any command
- Cause: validation or runtime error
- Resolution: review CLI output; rerun with `MTGA_COLLECTION_TRACE=1` for spans
