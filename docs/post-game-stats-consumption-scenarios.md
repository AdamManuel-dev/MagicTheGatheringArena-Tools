# Post-game stats consumption scenarios
Purpose: document consumer workflows for matches:stats and rank:progress outputs.

## Spreadsheet import (Excel/Google Sheets)
- Import CSV generated via `./bin/run matches:stats --out matches.csv`
- Provide pivot table template for deck vs opponent archetype win rates
- Schedule daily automation via cron + AppleScript to refresh data

## Dashboard integration (Grafana/Observable)
- Use JSON output piped into local REST service
- Map fields to time-series panels (rank progression) and bar charts (win rate by deck)
- Refresh interval: 5 minutes post-match batch processing

## Data science workflows
- Load JSON into Python pandas notebooks for deeper analysis
- Merge with telemetry (opt-in) to evaluate matchup confidence intervals
- Provide sample notebook in docs/examples (future)

## Sharing and reporting
- Generate Markdown summaries for team leagues with Writer tool templates
- Email weekly summary using CLI `writer:report --input matches.json`

## Edge cases
- Empty datasets: surface warning but still output headers
- Partial logs: mark rows with `confidence` column for transparency
