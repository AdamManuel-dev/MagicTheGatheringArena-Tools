# Collection export schema
Purpose: define schema, enrichment fields, and validation rules for collection:export command.

## Source data
- Player.log `CollectionDelta` events providing `internalEventName`, `payload` with `InventoryDelta`
- Aggregated counts per `grantedCards` with `cardId`, `count`
- Optional Scryfall enrichment via bulk dataset (arena_id → metadata)

## Core schema (CSV)
Columns:
1. `arena_id` (number)
2. `quantity` (number)
3. `name` (string, nullable when `--no-names`)
4. `set` (string, 3-4 letter code)
5. `collector_number` (string, preserve leading zeros)
6. `rarity` (string: common/uncommon/rare/mythic/special)
7. `colors` (string array joined by `|`, future addition)

## JSON schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["count", "cards"],
  "properties": {
    "count": {"type": "integer", "minimum": 0},
    "cards": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["arena_id", "quantity"],
        "properties": {
          "arena_id": {"type": "integer", "minimum": 0},
          "quantity": {"type": "integer", "minimum": 0},
          "name": {"type": ["string", "null"]},
          "set": {"type": ["string", "null"]},
          "collector_number": {"type": ["string", "null"]},
          "rarity": {"type": ["string", "null"]}
        }
      }
    }
  }
}
```

## Bulk enrichment workflow
1. On `--bulk`, download Scryfall default-cards bulk JSON (~80 MB) if cache older than 24 hours
2. Persist cache hash and timestamp to avoid redundant downloads
3. Populate map `arena_id → {name, set, collector_number, rarity}`
4. Provide CLI warning and fallback to per-card API when lookups missing

## Rarity breakdowns
- Additional aggregations for `collection:stats`: counts by rarity, set, color identity
- Validate totals match sum of `quantity`

## Validation pipeline
- Schema validation on JSON export using AJV (future)
- CSV snapshot tests using fixture logs
- Error handling: missing log → descriptive message; empty collection → instruct enabling Detailed Logs

## Future extensions
- Add foil indicator, wildcard progress, and booster counts when data available
- Support filtered exports (e.g., `--format standard`) once legality service integrated
