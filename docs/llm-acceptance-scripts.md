# LLM draft and brew acceptance scripts
Purpose: outline manual acceptance scenarios for llm:draft and llm:brew commands.

## llm:draft happy path
1. Prepare pack JSON with 14 cards and metadata
2. Run `./bin/run llm:draft --format premier --pack pack.json --pool pool.json`
3. Verify output JSON adheres to schema and recommended pick aligns with evaluation harness baseline
4. Confirm response under 5 seconds with cached model, <15 seconds with online model

## llm:draft failure recovery
- Scenario: Missing pack field → expect validation error referencing missing field
- Scenario: LLM returns invalid JSON → CLI retries once, then surfaces friendly message with trace flag suggestion
- Scenario: Provider timeout → ensure exponential backoff and user prompt to retry or switch provider

## llm:brew happy path
1. Export collection: `./bin/run extract --json --out collection.json`
2. Run `./bin/run llm:brew --format standard --collection collection.json`
3. Validate decklist legality, mana curve, and sideboard suggestions
4. Confirm Writer tool outputs import string ending with `Sideboard` delimiter

## llm:brew failure recovery
- Scenario: Missing API key → CLI instructs to set `MASTRA_OPENAI_API_KEY`
- Scenario: Legality violation detected → workflow re-prompts agent; final output includes compliance note
- Scenario: Collection constraint removes key card → output lists fallback options with same role

## Acceptance evidence
- Capture logs with `--trace` flag for each scenario
- Store asciicast or screenshot for documentation update
- Update implementation-log.md upon completion with links to evidence
