# Data files
Purpose: describe persistent files created by the MTG Arena CLI.

## Cache directories
| Path | Contents | Notes |
|------|----------|-------|
| `cache/logs/snapshots/` | Recent Player.log snapshots | Up to five files retained |
| `cache/data/datastore.json` | Serialized matches and decks | Updated by `matches:ingest` |
| `cache/exports/` | User-generated exports (CSV or JSON) | Location depends on flags |
| `cache/scryfall/` | Bulk dataset cache | Populated during `--bulk` runs |

## Datastore schema (`cache/data/datastore.json`)
- `matches`: array of objects containing:
  - `matchId` (string)
  - `queue` (string)
  - `deckId` (string, optional)
  - `deckName` (string, optional)
  - `opponent` (string, optional)
  - `opponentArchetype` (string, optional)
  - `startedAt` (ISO-8601 string)
  - `endedAt` (ISO-8601 string, optional)
  - `result` (`win`, `loss`, `draw`)
  - `games`: array of `{ gameId, result, opponentArchetype?, durationSeconds? }`
- `decks`: array of `{ deckId, name, format }`
- `updatedAt`: ISO-8601 timestamp of the last write

## Deck file schema
Deck definitions consumed by `odds:watch` follow this JSON structure:
- `cards`: array of objects with
  - `arena_id` (number)
  - `quantity` (number)
  - `name` (string, optional)
- `groups` (optional): array of objects with
  - `id` (string)
  - `label` (string)
  - `arena_ids` (array of numbers)

## Log sources
- `~/Library/Logs/Wizards Of The Coast/MTGA/Player.log`
- `~/Library/Logs/Wizards Of The Coast/MTGA/Player-prev.log`
- Cached snapshot files store concatenated contents with metadata in `cache/logs/latest.json`.

## Exit codes
- `0`: command succeeded and output stream completed.
- `1`: validation error or missing log data.
- `>1`: underlying Node.js or filesystem failure propagated by the runtime.
