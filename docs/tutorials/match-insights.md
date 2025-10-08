# Analyze match performance
Purpose: show returning players how to build match analytics from Arena logs.

**You will build:** A datastore plus summary table of match outcomes by deck.
**Time:** 40 minutes
**You will learn:** Creating a datastore, applying time filters, reading win rates.

## Before we begin
- Complete the [Getting started](getting-started.md) tutorial to build the CLI.
- Play at least one MTG Arena match after enabling Detailed Logs.
- Confirm `~/Library/Logs/Wizards Of The Coast/MTGA/Player.log`
  contains entries from today.

Preview the goal: a file at `cache/data/datastore.json` and a win-rate table that
highlights your decks for the past seven days.

## Step 1: ingest recent matches
Run the ingest command to parse your logs:
```bash
./bin/run matches:ingest --datastore cache/data/datastore.json
```

✓ Check: count the stored matches.
```bash
node -p "JSON.parse(fs.readFileSync('cache/data/datastore.json','utf8')).matches.length"
```
A non-zero number means the datastore captured your latest games.

## Step 2: focus on the current week
Generate a stats table scoped to the last seven days:
```bash
./bin/run matches:stats --group-by deck --since 7d
```

✓ Check: the output lists each deck with matches, wins, losses, and win rate.
If the table is empty, broaden the window using `--since 30d` and rerun step 2.

## Step 3: export results for sharing
Write a CSV snapshot for spreadsheets or dashboards:
```bash
./bin/run matches:stats --group-by deck --since 7d --out cache/stats/deck-stats.csv
```
Create the folder first if it is missing:
```bash
mkdir -p cache/stats
```

✓ Check: preview the CSV to confirm headers and data.
```bash
head -5 cache/stats/deck-stats.csv
```

## What you accomplished
- Captured matches into a reusable datastore
- Filtered results by time window for actionable win rates
- Produced a CSV export ready for analysis beyond the CLI

**Next:** Automate refreshes with [Scheduled exports](../how-to/scheduled-exports.md)
 or learn how aggregation works in [Architecture](../explanation/architecture.md).
