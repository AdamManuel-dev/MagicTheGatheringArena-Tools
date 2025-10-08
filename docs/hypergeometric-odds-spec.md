# Hypergeometric odds specification
Purpose: define inputs, assumptions, and output formats for odds:watch hypergeometric calculations.

## Deck state representation
- Total cards in library (`N`)
- Number of successes remaining (outs) per tracked category (`K`)
- Cards drawn per event (`n`), typically 1 for draw step, variable for multi-draw effects
- Mulligan adjustments: recompute `N` and `K` after mulligan resolution using presented decklist minus initial hand
- Exile/zone moves: adjust counts when cards leave the library (e.g., exile, hand, battlefield)

## Event handling
- Mulligan: decrement library size before first draw; outs removed from initial hand are excluded
- Opening hand: set baseline probabilities post-mulligan for “what-if” scenarios
- Draw step: recompute probability `P(X ≥ 1)` for each tracked card after every draw
- Multi-draw effects (e.g., Explore, Anticipate): treat as sequential draws with replacement decisions captured in log events
- Scry/surveillance: update deck order metadata to indicate top-card knowledge but probability remains hypergeometric with conditional modifiers

## Probability outputs
- Primary: probability of drawing at least one copy of target card(s) on next draw (`P(X ≥ 1)`)
- Secondary: cumulative probability within `k` draws (user-configurable horizon)
- Supporting metrics: expected number of draws to hit (E[X]), confidence intervals for multi-draw turns
- Display precision: two decimal places for percentages, with optional raw fraction in JSON

## JSON response schema
```json
{
  "deck_state": {
    "total_cards": 53,
    "tracked_groups": [
      {"id": "lands", "remaining": 23},
      {"id": "out:lightning-bolt", "remaining": 2}
    ]
  },
  "probabilities": [
    {
      "group_id": "lands",
      "next_draw": 0.4340,
      "within_horizon": {"draws": 3, "probability": 0.8201},
      "expected_draws": 2.3
    }
  ],
  "timestamp": "2025-10-08T00:00:00Z",
  "match_id": "1234-5678"
}
```

## CLI presentation
- Terminal table columns: Target, Remaining, Next Draw %, 3-Draw %, Expected Draws
- Refresh cadence: update on each GRE event that changes deck state (draw, card move)
- Highlight outs under 5% with dimmed styling; emphasize >70% with bold

## Validation & testing
- Unit tests covering known hypergeometric scenarios (e.g., 4-of outs in 53-card library)
- Replay tests using captured GRE event logs to ensure state transitions match expected probabilities
- Cross-check with combinatorial calculators for sanity during QA
