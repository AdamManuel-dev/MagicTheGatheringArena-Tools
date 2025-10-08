# CLI walkthrough scripts (Alpha commands)
Purpose: provide scripted flows with expected outputs for Alpha surface.

## collection:export
1. Command: `./bin/run extract --json`
2. Expected output: JSON payload with `count` > 0, first card includes `name`
3. Validation: confirm CSV fallback works with `./bin/run extract > out.csv`
4. Troubleshooting: if error "Could not read Player.log", reference docs/infrastructure-doc-requirements.md

## opponent:seen
1. Command: `./bin/run opponent:seen --limit 5`
2. Expected output: table listing match IDs, cards, counts
3. Scenario: apply `--group-by card` and ensure aggregated view sorts by count desc
4. JSON mode: `./bin/run opponent:seen --json --since 24h`

## odds:watch
1. Pre-req: sample GRE log replay using fixture script (TBD)
2. Command: `./bin/run odds:watch --deck sample-deck.json --replay --log fixtures/draw-sequence.log`
3. Expected behavior: outputs library size and table with tracked targets and probabilities
4. Live mode: run without `--replay` to tail Player.log with periodic refresh

## llm:rate
1. Command: `./bin/run llm:rate --deck deck.txt --format historic`
2. Expected output: summary table with risk flags, suggestions
3. Error handling: missing API key triggers helpful message with env var instructions

## llm:brew
1. Command: `./bin/run llm:brew --format standard --collection collection.json --budget rare<=12`
2. Expected output: decklist, sideboard, strategy summary
3. Validation: Writer tool provides Arena import string; Legality tool passes

## Checklist execution notes
- Record terminal screenshots or asciicast for documentation
- Update implementation-log.md with test evidence once fixtures exist
- Capture failures and convert into new TODOs or troubleshooting entries
- After ingesting matches with `./bin/run matches:ingest`, run `./bin/run matches:stats --group-by deck` to verify datastore updates.
