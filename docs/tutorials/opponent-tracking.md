# Track opponent cards
Purpose: help you capture opponent card lists from recent MTG Arena matches.

**You will build:** A CSV showing every card opponents cast in the last 20 games.
**Time:** 35 minutes
**You will learn:** Filtering match logs, grouping by card, exporting structured data.

## Before we begin
- Finish [Getting started](getting-started.md) so the CLI is installed.
- Play several Arena matches with Detailed Logs enabled.
- Ensure the log at `~/Library/Logs/Wizards Of The Coast/MTGA/Player.log`
  has a timestamp from today.

Preview the goal: a file named `opponents.csv` with columns for `card_name`, `seen_total`,
`match_count`, and `rarity`.

## Step 1: capture opponent activity
Run the opponent command with aggregation:
```bash
./bin/run opponent:seen --group-by card --limit 20 --bulk --out opponents.csv
```

✓ Check: confirm the CSV exists and contains headers.
```bash
head -5 opponents.csv
```

## Step 2: narrow to a weekly window
Regenerate the report for the last seven days only:
```bash
./bin/run opponent:seen --group-by card --since 7d --bulk --out opponents-7d.csv
```

✓ Check: verify `matches_scanned` in JSON matches expectations.
```bash
./bin/run opponent:seen --group-by card --since 7d --json | head -10
```
If the command reports no matches, expand the window with `--since 14d` and retry.

## Step 3: highlight key archetypes
Filter by a specific opponent tag or deck archetype when known:
```bash
OPPONENT=CoolMage#12345
OUT=opponents-coolmage.csv
./bin/run opponent:seen --group-by card --since 7d --opponent "$OPPONENT" --out "$OUT"
```

✓ Check: open the file and confirm only the targeted opponent appears:
```bash
grep -v CoolMage#12345 opponents-coolmage.csv && echo "Unexpected rows" || true
```

## What you accomplished
- Parsed logs into opponent-focused datasets
- Produced both CSV and JSON for flexible analysis
- Scoped results by time range and opponent identity

**Next:** Load the CSV into spreadsheets via [Scheduled exports](../how-to/scheduled-exports.md)
 or explore the parsing design in [Log ingestion](../explanation/log-ingestion.md).
