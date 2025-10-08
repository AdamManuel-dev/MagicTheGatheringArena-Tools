# LLM storytelling criteria
Purpose: define tone, length, and jargon rules for llm:explain and llm:matchplan narratives.

## Tone guidelines
- Default tone: confident, coaching voice with actionable phrasing
- Allow user flag `--tone casual|formal|hype`; adjust vocabulary accordingly
- Avoid condescension; emphasize collaborative language ("we want to", "consider")

## Length targets
- Short: ≤150 words for quick recaps (default)
- Medium: 151–300 words for detailed turn plans
- Long: 301–500 words when requested via `--length long`
- Enforce hard cap at 550 words to control latency and readability

## Structure
1. Opening summary (1-2 sentences)
2. Key objectives (bulleted list <=4 items)
3. Turn-by-turn or phase guidance
4. Risk callouts with mitigation suggestions
5. Closing reminder or alternate line

## Jargon rules
- Use card nicknames only if user supplies them; otherwise full card names on first mention
- Explain advanced terms on first use unless `--expert` flag enabled (e.g., "Tempo (maintain pressure while conserving resources)")
- Keep abbreviations capped (max 3 unique) and define them inline

## Accessibility considerations
- Provide color-safe callouts; avoid relying on color-only cues in CLI output
- Support optional `--plain` mode with ASCII-only formatting

## Validation checklist
- Automated lint ensures required sections present
- Word count verifier rejects overlong responses before display
- Tone analyzer ensures target adjectives present (e.g., "confident" words for default tone)

## Evaluation metrics
- User feedback rating integration (1-5 stars) when telemetry enabled
- Manual review backlog for low-rated plans (<3 average)
- Aim for comprehension score ≥4/5 in user surveys
