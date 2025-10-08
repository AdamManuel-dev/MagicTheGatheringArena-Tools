# Live TTY usability heuristics
Purpose: guide design of live terminal updates (odds:watch, opponent:seen).

## Refresh cadence
- Update no more than once per second to avoid terminal flicker
- Coalesce bursts of GRE events into single frame
- Provide `--refresh-ms` flag with floor at 250ms

## Color and emphasis
- Use ANSI colors sparingly; offer `--no-color`
- Highlight high-probability outs (>70%) in green, low (<10%) in red with accessibility-safe palette
- Use bold for changing values, dim for stale data

## Layout
- Fixed-width columns to prevent jitter; align decimals with formatters
- Reserve status line at bottom for context (match ID, turn, last update timestamp)
- For small terminals (<80 cols) switch to compact view without aggregated columns

## Truncation rules
- Ellipsize card names longer than 24 chars, but provide tooltip-style on hover via OSC 8 links
- Limit table rows to top 12 entries; provide pagination keys (j/k) or flag `--show-all`

## Input handling
- Support keyboard interrupts gracefully; ensure cursor resets on exit
- Provide `--follow` to tail new matches automatically when running in tmux

## Accessibility
- Ensure compatibility with screen readers by offering `--json` streaming output
- Respect `NO_COLOR` environment variable
- Document recommended terminal settings in troubleshooting guide
