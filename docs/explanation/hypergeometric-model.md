# Hypergeometric model
Purpose: clarify how draw odds are computed during `odds:watch` sessions.

## Problem shape
Live tracking estimates the likelihood of seeing specific cards as the library shrinks.
Every draw removes a card from the population, so probabilities must update without
replacement. The model treats the deck as a finite population where successes equal the
remaining copies of a tracked card or card group.

## Core equations
The `hypergeometricProbability` helper evaluates:

- Population size `N`: cards still in the library
- Population successes `K`: copies of the tracked target remaining
- Draws `n`: number of cards drawn since the observation point
- Successes `k`: copies hit during those draws

The probability of drawing exactly `k` successes is:
```
[ C(K, k) × C(N - K, n - k) ] / C(N, n)
```
`hypergeometricAtLeast` accumulates probabilities for `k` through the allowed maximum to
produce "Within 3 %" in the CLI table.

## Expected draws
`expectedSuccesses` multiplies the draw count by the success ratio (`n × K / N`) to provide
the "Expected Draws" column. This shows the mean number of cards until the target appears,
which guides mulligan or sequencing decisions mid-match.

## Numerical stability
Inputs pass through `validateInput`, guarding against impossible states (negative counts,
more successes than population, or draw counts larger than the deck). The combination
routine minimizes overflow by folding the factorial terms into successive multiplications
with `k = min(k, n - k)`.

## Model boundaries
- Shuffling or drawing effects that return cards to the library violate the without-
  replacement assumption; the CLI logs a warning when such events are detected.
- Milling or scrying adjusts `populationSize` and `draws` in real time, maintaining accuracy
  as long as Player.log reports the zone changes.
- Group tracking assumes independence between groups; overlapping arena IDs create shared
  state and should be avoided in deck JSON definitions.
