# Monitor live draw odds
Purpose: walk through setting up a live hypergeometric session for MTG Arena.

**You will build:** A real-time odds table for tracked cards in your current deck.
**Time:** 30 minutes
**You will learn:** Preparing deck JSON files, running `odds:watch`, interpreting output.

## Before we begin
- Finish [Track opponent cards](opponent-tracking.md) or earlier tutorials so you know
  the CLI basics.
- Prepare a deck list with arena IDs (see `test/fixtures/decks/` for examples).
- Confirm Player.log updates while Arena is open.

Preview the end state: a terminal table with columns `Target`, `Remaining`, `Next Draw %`,
`Within 3 %`, and `Expected Draws` updating as you play.

## Step 1: create a deck profile
Write a JSON file describing the deck cards and tracked groups:
```bash
mkdir -p decks
cat > decks/izzet-phoenix.json <<'JSON'
{
  "cards": [
    {"arena_id": 68271, "name": "Arclight Phoenix", "quantity": 4},
    {"arena_id": 67379, "name": "Consider", "quantity": 4},
    {"arena_id": 67664, "name": "Lightning Axe", "quantity": 2}
  ],
  "groups": [
    {"id": "phoenix", "label": "Arclight Phoenix", "arena_ids": [68271]},
    {"id": "cantrips", "label": "Topdeck Cantrips", "arena_ids": [67379]}
  ]
}
JSON
```

✓ Check: validate the JSON structure quickly.
```bash
node -e "JSON.parse(fs.readFileSync('decks/izzet-phoenix.json','utf8'))"
```

## Step 2: launch the live session
Start the odds watcher before queueing in Arena:
```bash
./bin/run odds:watch --deck decks/izzet-phoenix.json --track 68271 --track 67379
```

✓ Check: the first table shows four Phoenix copies remaining and non-zero draw odds.
If nothing appears, ensure Arena is running and Detailed Logs stay enabled.

## Step 3: replay a log snapshot
Practice with recorded data without opening Arena:
```bash
LOG_PATH=cache/logs/snapshots/latest.log
./bin/run odds:watch --deck decks/izzet-phoenix.json --replay --log "$LOG_PATH" --max-updates 3
```

✓ Check: the command exits after three updates, confirming replay mode works for tests.

## What you accomplished
- Authored a reusable deck JSON profile
- Monitored live draw odds while playing and via replay mode
- Learned to limit updates for deterministic automation runs

**Next:** Automate refreshes with [Scheduled exports](../how-to/scheduled-exports.md)
and review probability math in [Hypergeometric model](../explanation/hypergeometric-model.md).
