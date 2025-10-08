# LLM draft pick prompts
Purpose: specify prompt structure, constraints, and validation for llm:draft feature.

## Inputs
- Pack description: card list with oracle text, card type, color identity, pick order
- Draft context: seat number, format (e.g., LTR Premier Draft), archetype leanings, prior picks summary
- Constraints: desired curve distribution, color commitments, synergy tags

## Prompt template (system)
"You are DraftAgent, an MTG Arena limited expert. Evaluate the current pack and recommend the best pick for the specified format. Consider curve, synergies, and deck needs. Respond with JSON matching the schema."

## Prompt template (user)
```
Format: {{format}}
Seat: {{seat}}
Pack #: {{packNumber}}, Pick #: {{pickNumber}}
Current pool summary:
{{poolSummary}}
Pack cards:
{{cardsTable}}
Constraints:
- Curve target: {{curveTarget}}
- Colors committed: {{colors}}
- Synergy tags: {{synergyTags}}
```

## Output schema
```json
{
  "pick": {
    "card_name": "",
    "priority": 1,
    "reasons": [""],
    "curve_impact": {"cmc": 2, "slot": "two-drop"},
    "synergy_tags": ["spells-matter"],
    "risk_flags": ["requires early removal"]
  },
  "alternatives": [
    {
      "card_name": "",
      "priority": 2,
      "when_to_pick": "If committing to Dimir control"
    }
  ]
}
```

## Validation rules
- JSON must conform to schema; use Zod with explicit errors
- `priority` unique across recommendations
- `reasons` array must include at least two concise points
- `risk_flags` optional but capped at three entries

## Evaluation strategy
- Offline eval set of 100 historical draft decisions with human-rated picks
- Metrics: top-1 agreement ≥60%, top-3 ≥85%
- Capture telemetry for pick success when opted-in (win rate impact)

## Safety/guardrails
- Forbid decklists with fewer than 23 spells or 17 lands suggestions in follow-up
- Disallow referencing external tier lists; rely on provided context only
- Enforce 500 token maximum response to maintain latency
