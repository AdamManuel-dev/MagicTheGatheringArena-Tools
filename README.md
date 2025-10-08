# MTG Arena Collection Extractor

A modern CLI tool for extracting your MTG Arena card collection and tracking opponent cards from log files on macOS. Built with **oclif** and **TypeScript**.

## Features

- 📊 **Multiple Output Formats**: Export as CSV or JSON
- 🔍 **Scryfall Integration**: Resolve arena IDs to card names, sets, and rarity
- ⚡ **Bulk Mode**: Fast name resolution using Scryfall's bulk dataset
- 🎯 **Flexible Options**: ID-only mode, custom log paths, file output
- 🍎 **macOS Native**: Reads from standard MTGA log locations
- 🎮 **Opponent Tracking**: Extract cards your opponents played against you
- ⏱️ **Time Filtering**: Filter matches by date ranges or relative time
- 📈 **Aggregation**: View card totals across all matches

## Prerequisites

- **Node.js** >= 18
- **MTG Arena** installed on macOS
- **Detailed Logs** enabled in Arena (see Setup below)

## Installation

```bash
# Clone or download this project
cd mtga-collection

# Install dependencies
npm install

# Build the project
npm run build
```

## Setup: Enable Detailed Logs in MTGA

1. Open **MTG Arena**
2. Navigate to **Options → View Account**
3. Enable **"Detailed Logs (Plugin Support)"**
4. **Restart MTG Arena**
5. Open your **Collection screen** at least once

This ensures the log files contain detailed event data for both collection tracking and match analysis.

## Usage

## Command: `extract`

Extract your complete MTG Arena collection.

### Basic Usage (CSV to stdout)

```bash
./bin/run extract > collection.csv
```

### JSON Output

```bash
./bin/run extract --json > collection.json
```

### Fast Bulk Mode

Uses Scryfall's bulk dataset for faster name resolution:

```bash
./bin/run extract --bulk --out collection.csv
```

### Arena IDs Only (No Network Calls)

Skip Scryfall lookups and export only arena_id + quantity:

```bash
./bin/run extract --no-names > arena_ids.csv
```

### Custom Log Path

```bash
./bin/run extract --log ~/Desktop/Player.log
```

### All Available Flags

```
FLAGS
  --json              Output JSON instead of CSV
  --no-names          Skip Scryfall lookups (arena_id + qty only)
  --bulk              Use Scryfall bulk dataset for faster name resolution
  --log=<path>        Custom path to Player.log
  --out=<file>        Write to file instead of stdout
```

## Output Format

### CSV (default)

```csv
arena_id,quantity,name,set,collector_number,rarity
69172,4,"Lightning Bolt",M10,146,common
75929,2,"Thoughtseize",THS,107,rare
```

### JSON

```json
{
  "count": 1234,
  "cards": [
    {
      "arena_id": 69172,
      "quantity": 4,
      "name": "Lightning Bolt",
      "set": "M10",
      "collector_number": "146",
      "rarity": "common"
    }
  ]
}
```

---

## Command: `opponent:seen`

Track cards your opponents played against you by parsing match logs.

### Basic Usage

```bash
# Last 10 matches (default), grouped per match
./bin/run opponent:seen

# JSON output with 50 matches
./bin/run opponent:seen --json --limit 50

# Save to file
./bin/run opponent:seen --bulk --out seen_opponents.csv
```

### Time Filtering

```bash
# Last 7 days
./bin/run opponent:seen --since 7d

# Specific date range
./bin/run opponent:seen --from 2025-10-01 --to 2025-10-08

# Last 24 hours
./bin/run opponent:seen --since 24h
```

### Aggregation and Sorting

```bash
# Aggregate across all matches, sorted by most-seen
./bin/run opponent:seen --group-by card --sort desc

# Filter by specific opponent
./bin/run opponent:seen --opponent "CoolMage#12345"
```

### Advanced Options

```bash
# Track only specific event types
./bin/run opponent:seen --include cast,etb

# IDs only (no Scryfall lookups)
./bin/run opponent:seen --no-names

# Fast bulk name resolution
./bin/run opponent:seen --bulk
```

### Available Flags

```
FLAGS
  --json                Output JSON instead of CSV
  --out=<file>          Write to file instead of stdout
  --limit=<n>           Number of matches to scan (default: 10)
  --since=<rel>         Relative time window (24h, 7d, 30d)
  --from=<date>         ISO start date (use with --to)
  --to=<date>           ISO end date (use with --from)
  --opponent=<tag>      Filter by opponent name/tag
  --group-by=<mode>     match | card (default: match)
  --include=<events>    Comma-separated: cast,etb,revealed,move (default: all)
  --no-names            Skip Scryfall lookups (IDs only)
  --bulk                Use Scryfall bulk dataset for fast lookups
  --log=<path>          Custom path to Player.log
  --sort=<order>        asc | desc (for --group-by card)
```

### Output Formats

#### CSV (grouped by match)

```csv
match_id,started_at,opponent,card_name,set,collector_number,arena_id,first_seen,seen_count
A1B2C3,2025-10-07T23:14:12Z,CoolMage#12345,"Go for the Throat",BRO,102,123456,cast,2
A1B2C3,2025-10-07T23:14:12Z,CoolMage#12345,Sheoldred,DMU,107,654321,etb,1
```

#### JSON (aggregated by card)

```json
{
  "scope": {
    "matches_scanned": 42,
    "unique_cards": 87
  },
  "cards": [
    {
      "arena_id": 123456,
      "card_name": "Go for the Throat",
      "set": "BRO",
      "collector_number": "102",
      "rarity": "uncommon",
      "seen_total": 15,
      "match_count": 8
    }
  ]
}
```

### Event Types

- **cast**: Spell cast by opponent
- **etb**: Permanent entered the battlefield
- **revealed**: Card revealed from hand/library
- **move**: Card moved to graveyard or exile

### Important Notes

- **Detailed Logs Required**: Enable "Detailed Logs (Plugin Support)" in Arena settings
- **macOS Log Path**: `~/Library/Application Support/com.wizards.mtga/Logs/Logs/Player.log`
- **Session Limits**: Current session in `Player.log`, previous in `Player-prev.log`
- **Visibility**: Only tracks cards the opponent revealed or played (not hidden cards in hand/library)

---

## How It Works

1. **Log Parsing**: Scans `Player.log` and `player-prev.log` for collection data
2. **Extraction**: Parses `InventoryInfo` or `GetPlayerCardsV3` JSON blobs
3. **Name Resolution**:
   - `--bulk`: Downloads Scryfall's entire card database (~50MB, cached)
   - Default: Per-card API lookups (slower, more reliable for new cards)
4. **Export**: Outputs CSV or JSON with card details

## Project Structure

```
mtga-collection/
├── bin/
│   └── run                         # Executable entry point
├── src/
│   ├── commands/
│   │   ├── extract.ts              # Collection extraction command
│   │   └── opponent/
│   │       └── seen.ts             # Opponent tracking command
│   ├── lib/
│   │   ├── logs.ts                 # Collection log parsing
│   │   ├── matches.ts              # Match log parsing & event extraction
│   │   ├── time-utils.ts           # Time filtering utilities
│   │   └── scryfall.ts             # Scryfall API integration
│   └── index.ts                    # oclif entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally
./bin/run extract --help

# Make changes to src/, then rebuild
npm run build
```

## Troubleshooting

### "Could not read Player.log"

- Verify MTG Arena is installed at the standard macOS location
- Check that `~/Library/Logs/Wizards Of The Coast/MTGA/Player.log` exists
- Ensure you've opened Arena and viewed your Collection screen

### "No owned cards found in the log"

- Enable **Detailed Logs** in Arena settings (see Setup above)
- Restart Arena after enabling
- Open your Collection screen to trigger a log entry
- Check the log file has recent timestamps

### "Bulk load failed"

- Network connectivity issue with Scryfall
- Fallback to per-card lookups will happen automatically
- Retry or check your internet connection

## API Rate Limits

- **Scryfall API**: No official rate limit, but please be respectful
- **Bulk mode** (recommended): Single bulk download, then local lookups
- **Per-card mode**: One API call per unique card (slower but works for new releases)

## License

MIT

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Acknowledgments

- **Scryfall** for their amazing MTG card database API
- **oclif** for the excellent CLI framework
- **Wizards of the Coast** for MTG Arena

---

**Note**: This tool is unofficial and not affiliated with Wizards of the Coast. MTG Arena and Magic: The Gathering are trademarks of Wizards of the Coast LLC.
# MagicTheGatheringArena-Tools
