# CLI commands
Purpose: describe command interfaces, flags, outputs, and side effects for the MTG Arena CLI.

## Runtime requirements
- Binary: `bin/run`
- Node runtime: >= 20.0.0
- Default log directory: `~/Library/Logs/Wizards Of The Coast/MTGA`
- Exit codes: `0` success, `1` validation failure, other values bubble from Node errors

## collection:export
- Identifier: `collection:export`
- Summary: Extract owned cards from Player.log with optional Scryfall enrichment.
- Output modes: CSV (default), JSON via `--json`
- Side effects: optional file write when `--out` is provided; Scryfall HTTP calls

**Flags**
| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--json` | boolean | `false` | Emit JSON payload with `count` and `cards` keys |
| `--no-names` | boolean | `false` | Omit Scryfall lookups and return arena IDs only |
| `--bulk` | boolean | `false` | Refresh cached Scryfall bulk dataset before lookup |
| `--log` | string | `null` | Absolute path to Player.log override |
| `--out` | string | `null` | Destination file path for output |

**CSV layout**
`arena_id,quantity,name,set,collector_number,rarity`

**JSON layout**
```json
{
  "count": number,
  "cards": [
    {
      "arena_id": number,
      "quantity": number,
      "name": string | null,
      "set": string | null,
      "collector_number": string | null,
      "rarity": string | null
    }
  ]
}
```

## extract
- Identifier: `extract`
- Summary: Legacy alias that delegates to `collection:export`.
- Flag surface: identical to `collection:export`.

## opponent:seen
- Identifier: `opponent:seen`
- Summary: Parse recent matches and report opponent card appearances.
- Output modes: CSV (default), JSON via `--json`
- Side effects: optional file write; Scryfall HTTP calls when names are resolved

**Flags**
| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--json` | boolean | `false` | Emit JSON document with matches and cards arrays |
| `--out` | string | `null` | Destination file path for output |
| `--limit` | integer | `10` | Maximum matches scanned in chronological order |
| `--since` | string | `null` | Relative window such as `24h`, `7d`, `30d` |
| `--from` | string | `null` | ISO start date, used with `--to` |
| `--to` | string | `null` | ISO end date, used with `--from` |
| `--opponent` | string | `null` | Exact opponent identifier filter |
| `--group-by` | string | `match` | Aggregation mode: `match` or `card` |
| `--include` | string | `cast,etb,revealed,move` | Event types retained during parsing |
| `--no-names` | boolean | `false` | Skip Scryfall lookups |
| `--bulk` | boolean | `false` | Prefer cached bulk map for name resolution |
| `--log` | string | `null` | Absolute path to Player.log override |
| `--sort` | string | `null` | Sort order `asc` or `desc` when grouping by card |

**CSV layout (match mode)**
`match_id,started_at,opponent,card_name,set,collector_number,arena_id,first_seen,seen_count`

**CSV layout (card mode)**
`arena_id,card_name,set,collector_number,rarity,seen_total,match_count`

**JSON layout (card mode)**
```json
{
  "matches_scanned": number,
  "cards": [
    {
      "arena_id": number,
      "card_name": string | null,
      "set": string | null,
      "collector_number": string | null,
      "rarity": string | null,
      "seen_total": number,
      "match_count": number
    }
  ]
}
```

## matches:ingest
- Identifier: `matches:ingest`
- Summary: Append parsed match summaries to the local datastore JSON file.
- Side effects: writes to datastore path, defaults to `cache/data/datastore.json`

**Flags**
| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--log` | string | `null` | Absolute path to Player.log override |
| `--datastore` | string | `null` | Destination datastore override |

**Output**
- Logs `No new matches found.` or `Ingested N new matches.` via stdout.

## matches:stats
- Identifier: `matches:stats`
- Summary: Aggregate stored matches by deck, queue, or opponent archetype.
- Output modes: table (default), CSV via `--out`, JSON via `--json`
- Inputs: datastore JSON produced by `matches:ingest`

**Flags**
| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--group-by` | string | `deck` | Aggregation dimension: `deck`, `queue`, `opponentArchetype` |
| `--queue` | string | `null` | Queue filter applied before aggregation |
| `--deck` | string | `null` | Deck name or ID filter |
| `--since` | string | `null` | Relative window such as `24h`, `7d`, `30d` |
| `--from` | string | `null` | ISO start date |
| `--to` | string | `null` | ISO end date |
| `--json` | boolean | `false` | Emit JSON payload with `groupBy` and `matches` keys |
| `--out` | string | `null` | Destination file path; CSV when combined with default output |
| `--datastore` | string | `null` | Datastore file override |

**Table columns**
`deck|queue|opponentArchetype, matches, wins, losses, draws, win rate %`

## odds:watch
- Identifier: `odds:watch`
- Summary: Stream draw odds for tracked cards based on live or replayed logs.
- Output mode: continuously rendered ASCII table
- Inputs: deck JSON file containing `cards` array and optional `groups`

**Flags**
| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--deck` | string | required | Path to deck JSON definition |
| `--log` | string | `null` | Absolute path to Player.log override |
| `--track` | integer (repeatable) | `[]` | Explicit arena IDs tracked when groups absent |
| `--seat` | integer | `1` | Player seat identifier |
| `--replay` | boolean | `false` | Process a snapshot once and exit |
| `--max-updates` | integer | `0` | Stop after N table refreshes when > 0 |
| `--poll-interval` | integer | `500` | Live mode poll interval in milliseconds |

**Table columns**
`Target, Remaining, Next Draw %, Within 3 %, Expected Draws`

## Supporting files
- `cache/logs/snapshots`: persists up to five Player.log snapshots for reuse
- `cache/data/datastore.json`: durable match datastore consumed by stats commands
- Deck JSON schema: `cards` array of `{ "arena_id": number, "quantity": number }`
