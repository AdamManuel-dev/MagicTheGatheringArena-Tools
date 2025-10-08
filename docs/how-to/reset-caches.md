# Reset caches and recover space
Purpose: clean up Scryfall, log, and datastore caches when troubleshooting.

## Quick answer
```bash
rm -rf cache/scryfall cache/logs/snapshots
./bin/run collection:export --bulk --out cache/exports/refresh.csv
```

## Remove only Scryfall data
```bash
rm -rf cache/scryfall
./bin/run collection:export --bulk --out cache/exports/refresh.csv
```
Use when bulk lookups produce stale or missing card names.

## Keep snapshots but reset datastore
```bash
rm -f cache/data/datastore.json
./bin/run matches:ingest --datastore cache/data/datastore.json
```
This rebuilds the datastore from current logs without touching past snapshots.

## If permission errors occur
- Confirm no MTG Arena process is writing logs while deleting directories.
- Recreate folders with `mkdir -p cache/scryfall cache/logs/snapshots cache/data`
  before rerunning commands.

## Related tasks
- [Scheduled exports](scheduled-exports.md)
- [Data files](../reference/data-files.md)
