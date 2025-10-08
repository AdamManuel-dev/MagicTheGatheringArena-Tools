# Brew and matchplan prompt flows
Purpose: outline Mastra workflows for llm:brew and llm:matchplan commands, including inputs, stages, and fallbacks.

## llm:brew workflow
1. **Gather context**
   - Inputs: target format, constraints (budget, colors, archetype goals), collection snapshot (optional)
   - Tools: Scryfall tool for legality, Writer tool for Arena imports
2. **Ideation prompt**
   - System: "You are BrewAgent, tasked with building a {{format}} deck respecting constraints."
   - User: includes goals, banned cards, must-include list, meta considerations
3. **Validation stage**
   - Run legality checks via Legality tool; re-prompt with violations highlighted if needed
   - Evaluate mana curve, land count; enforce heuristics (≤4 copies, 60-card minimum)
4. **Refinement**
   - Ask agent to provide sideboard options and flex slots when over budget or incomplete
5. **Output assembly**
   - JSON with decklist, sideboard, strategy summary, matchup considerations

### Fallback strategy
- If collection constraints eliminate key cards, request alternatives sorted by availability
- On tool failure, degrade to high-level plan with notes and add TODO for missing cards

## llm:matchplan workflow
1. **Input preparation**
   - Recent matches or opponent archetype summary, decklist, targeted matchup
2. **Threat analysis prompt**
   - Extract top threats from opponent logs; feed as structured JSON to agent
3. **Plan generation**
   - System: "You are PlanAgent. Produce a sideboarding and game plan for {{archetype}} vs {{opponent}}."
   - Include phases: Early Game, Mid Game, Sideboard Plan, Key Risks
4. **Validation**
   - Ensure sideboard suggestions exist in collection; flag if missing
   - Check narrative tone against storytelling criteria doc
5. **Delivery**
   - Output Markdown with sections, plus JSON summary for automation

### Fallbacks
- Missing logs → request manual opponent description, degrade to generic plan
- Contradictory data → highlight uncertainty in Notes section

## Shared tooling
- Logs tool to parse opponent patterns
- Math tool for odds references if needed (e.g., probability of drawing sweeper)
- Tracing hooks capturing each prompt/response for evaluation

## Testing
- Golden transcripts for top archetype matchups
- Eval harness scoring clarity, legality, adherence to constraints
