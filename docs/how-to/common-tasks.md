# Common tasks
Purpose: provide direct procedures for routine MTG Arena CLI workflows.

## Export the collection to CSV
**Quick answer**
```bash
./bin/run collection:export --bulk --out collection.csv
```

**For production sync jobs**
```bash
./bin/run collection:export --bulk --json --out cache/exports/collection.json
```
Add `--no-names` when running offline to skip Scryfall calls.

**If you see "Could not read Player.log"**
- Point to the log explicitly:
  `--log "~/Library/Logs/Wizards Of The Coast/MTGA/Player.log"`
- Confirm Detailed Logs are enabled and rerun

## Capture opponent cards for review
**Quick answer**
```bash
./bin/run opponent:seen --limit 25 --group-by card --sort desc --bulk --out opponents.csv
```

**For JSON analytics pipelines**
```bash
./bin/run opponent:seen --json --since 72h --out cache/opponents.json
```
Add `--include cast,etb` to narrow event types when volume is high.

**If the command reports "No matches found"**
- Increase the window: `--since 14d`
- Remove opponent filters and rerun, then reapply filters one by one

## Monitor live draw odds while playing
**Quick answer**
```bash
./bin/run odds:watch --deck decks/mono-red.json --track 66748 --track 66955
```

**For testing a recorded session**
```bash
./bin/run odds:watch --deck decks/gruul.json --replay --log cache/logs/snapshots/latest.log
```
Add `--max-updates 5` in CI or scripted checks to limit output size.

**If deck parsing fails**
- Validate the JSON schema: `cards` array with numeric `arena_id` and `quantity`
- Ensure tracked arena IDs appear in the deck list before rerunning
