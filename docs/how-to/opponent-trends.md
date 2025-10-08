# Analyze opponent trends
Purpose: surface repeat opponent strategies from stored match data.

## Quick answer
```bash
OUT=cache/stats/opponents-14d.json
./bin/run matches:stats --group-by opponentArchetype --since 14d --json > "$OUT"
```

## Segment by queue
```bash
QUEUE="Ranked Standard"
OUT=cache/stats/opponents-standard.csv
./bin/run matches:stats --group-by opponentArchetype --queue "$QUEUE" --since 30d --out "$OUT"
```
Use spreadsheet filters on the CSV to sort by win rate or match volume.

## Spotlight specific rivals
```bash
./bin/run matches:stats --group-by opponentArchetype --since 30d | grep CoolMage
```
Pair this with `--deck` to study a single build against the rival archetype.

## If the table is empty
- Run `./bin/run matches:ingest --datastore cache/data/datastore.json` before retrying.
- Drop the queue filter and re-run with a longer window such as `--since 60d`.

## Related tasks
- [Common tasks](common-tasks.md)
- [CLI commands](../reference/api.md)
