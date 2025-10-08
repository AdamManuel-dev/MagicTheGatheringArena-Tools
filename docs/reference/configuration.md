# Configuration
Purpose: describe configuration files, profiles, and environment variables for the CLI.

## Files
| Path | Description |
|------|-------------|
| `~/.mtga-collection/config.json` | User profiles, tracing toggles, provider overrides |
| `cache/config/profile.json` | Generated during tests to isolate settings |

## Profile structure
```json
{
  "profiles": {
    "default": {
      "tracing": {
        "enabled": false,
        "path": "cache/tracing"
      },
      "scryfall": {
        "bulkCacheTtlHours": 24
      }
    }
  }
}
```
Profiles may include provider API keys, redaction rules, and feature flags referenced by
the command layer.

## Environment variables
| Variable | Effect |
|----------|--------|
| `MTGA_COLLECTION_PROFILE` | Selects a profile within the config file |
| `MTGA_COLLECTION_TRACE` | Enables tracing when set to `1` or `true` |
| `MTGA_COLLECTION_CACHE_DIR` | Overrides the root cache directory |
| `SCRYFALL_BULK_URL` | Custom bulk download endpoint (testing only) |

## Resolution order
1. CLI flags (highest precedence)
2. Environment variables
3. Active profile in `config.json`
4. Built-in defaults within `src/lib/config/provider.ts`

## Reloading configuration
- `collection:export`, `opponent:seen`, and `odds:watch` read config on startup.
- `matches:ingest` reloads when invoked, so profile changes require rerunning commands.
