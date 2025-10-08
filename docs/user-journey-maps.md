# User journey maps
Purpose: map experiences for ladder grinder, brewer, and limited player archetypes.

## Ladder grinder
1. Enable Detailed Logs following setup guide
2. Run `odds:watch` during live matches via terminal multiplexer
3. Review opponent:seen output post-match
4. Generate daily `matches:stats --json` and import into spreadsheet template
5. Adjust decklist using llm:rate suggestions

Pain points & opportunities:
- Needs fast toggle between live tracking and summaries → provide `--follow` mode shortcuts
- Desires daily recap email → future automation task
- Wants assurance logs captured → add CLI confirmations after match sessions

## Brewer
1. Export collection with `collection:export --json --out collection.json`
2. Run `llm:brew --format historic --budget mythic-rare<=4` with collection filter
3. Validate legality via CLI output; review sideboard plan
4. Save brew using Writer tool to Arena import string
5. Queue matches, run `llm:matchplan` against common archetypes

Pain points & opportunities:
- Needs quick filters for owned wildcards → integrate in collection stats
- Wants persistent profiles for preferred models → GA profile subsystem
- Requires guidance when budget constraints conflict → highlight fallback suggestions

## Limited player
1. Start draft, run `llm:draft --format premier --trace` with live pack data
2. After draft, invoke `llm:limited-build --pool pool.json`
3. Review build summary, adjust land counts if necessary
4. Use `odds:watch --deck decklist.json` during matches
5. After event, run `matches:stats --queue limited` for performance review

Pain points & opportunities:
- Extracting pack data quickly is challenging → create helper to capture clipboard or OCR
- Needs offline safety net → plan cached oracle text and heuristics when LLM unavailable
- Wants recommended sideboard guides for best-of-three → extend matchplan for limited modes
