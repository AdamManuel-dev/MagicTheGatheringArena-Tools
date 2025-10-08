PRD — Mastra-Powered Agent Layer for the MTGA oclif CLI

Scope update: includes feature parity (where feasible) with Untapped.gg Companion & web app

Product: mtga-collection (oclif + TypeScript + Mastra agents)
Owner: You
Date: Oct 8, 2025

⸻

1) Summary

We’re adding a Mastra agent layer to the existing CLI so players can get overlay-style insights without an overlay: deck/collection analytics from Player.log, plus LLM-driven ratings, brews, and match plans. We will also copy (adapt) key Untapped.gg features to a terminal + file-export workflow:
	•	During game: show decklist state, draw/land odds, and a live list of opponent cards seen (terminal “watch” instead of an overlay). Untapped’s Companion highlights these exact functions in its overlay (decklist access, draw odds, cards opponent has played).  ￼
	•	After game: personal stats (ladder progress, deck performance, matchups). Untapped markets these on its Companion page; we’ll mirror as CSV/Markdown/JSON reports.  ￼
	•	Collection: full collection export and stats; Untapped supports one-click CSV export via account (Premium). We do it fully local from Player.log.  ￼
	•	Limited: “Draftsmith-like” helper (rate picks, build deck) powered by our LLM agent, not Untapped’s ratings DB. Draftsmith itself provides pick ratings and auto-build recommendations.  ￼

Technical note: All of these are feasible from MTGA’s Detailed Logs that trackers read; Untapped’s help/docs confirm the Companion watches Player.log when plugin logs are enabled.  ￼

⸻

2) Goals / Non-Goals

Goals
	1.	Feature parity (CLI form) with Untapped essentials
	•	Live deck odds & opponent-cards-seen during play; per-match & aggregate post-game stats.  ￼
	•	Collection export + set/rarity rollups (no web account required).  ￼
	•	LLM agents for draft picks, deck brews, explainers, match plans (Mastra workflows).
	2.	TypeScript-native, auditable AI
	•	Mastra agents, tools, workflows, tracing/evals for reproducible pipelines.

Non-Goals
	•	No desktop overlay (we’re CLI).
	•	No global meta/tier list from “millions of games” (Untapped’s website feature); we won’t crowd-source ladder data.  ￼

⸻

3) Competitive Feature Mapping (Untapped → CLI)

Untapped.gg feature	Source	Our CLI counterpart
Overlay shows your deck, draw odds, and opponent cards played	Companion page (“Plan every move… Know the odds… Never forget which cards your opponent has already played…”)  ￼	odds:watch (live hypergeometric odds), opponent:seen (per-match + aggregate), TTY table/JSON export
Personal statistics: ladder progression, deck performance, matchup stats	Companion marketing (“Visualize your game data… ladder progression, deck performance, matchup statistics…”)  ￼	matches:stats, rank:progress (CSV/JSON charts-ready)
Collection sync & CSV export	Premium/announcements (CSV export w/ counts)  ￼	collection:export (local parse of Player.log), collection:stats
Draftsmith: pick ratings & auto-build	Draftsmith page (best pick; recommends optimal deck)  ￼	llm:draft (LLM pick rationale from oracle text), llm:limited-build (auto-build with constraints)
Global meta / Tier lists (website)	Global stats launch & Premium pages  ￼	Out of scope (no crowd data); optional user-local summaries only


⸻

4) Users & Use Cases
	•	Arena ladder grinders: want odds, opponent-seen list, and post-match stats without running an overlay.
	•	Brawl/Historic Brawl brewers: want collection-constrained brews & explanations.
	•	Limited players: want “Draftsmith-like” guidance—but derived from LLM reasoning over card text (not paid ratings).  ￼

⸻

5) Feature Set (v1)

F1 — Live Game “Overlay” in Terminal
	•	odds:watch — tails Player.log; shows remaining counts & draw/land odds for top outs (hypergeometric). Mirrors Companion’s “know the odds” goal.  ￼
	•	opponent:seen — per match and aggregated “cards opponent has already played”.  ￼

F2 — Post-Game Stats
	•	matches:stats — win-rate by deck, queue, opponent archetype;
	•	rank:progress — ladder progression time-series. These echo Untapped’s personal stats offering.  ￼

F3 — Collection
	•	collection:export — CSV/JSON of owned cards (arena_id→qty + names via Scryfall). Comparable to Untapped’s CSV export, but fully local.  ￼
	•	collection:stats — counts by set/rarity/color.

F4 — Limited Helpers (LLM-backed)
	•	llm:draft — pick suggestions + explanations using Scryfall oracle text;
	•	llm:limited-build — optimal 40 with curve/lands checks. Mirrors Draftsmith’s “always build the best deck,” replacing ratings DB with an agent.  ￼

F5 — Constructed/Brawl LLM
	•	llm:rate (card/shortlist roles & risks), llm:brew (collection-constrained decks), llm:explain (mulligans/lines), llm:matchplan (tech swaps based on logs).

⸻

6) Architecture

6.1 Components
	•	oclif CLI commands (TypeScript).
	•	Mastra instance with:
	•	Agents: RaterAgent, BrewAgent, PlanAgent, DraftAgent, ExplainAgent
	•	Tools (Zod-typed):
	•	Logs Tool (parse Player.log / player-prev.log),
	•	Scryfall Tool (bulk default_cards cache; per-ID fallback),
	•	Math Tool (hypergeometric odds),
	•	Legality Tool (format, color identity, singleton),
	•	Writer Tool (Arena import, CSV/MD).
	•	Workflows:
	•	BrewWorkflow (retrieve → propose → verify → revise),
	•	MatchPlanWorkflow (aggregate → cluster → propose swaps).
	•	Observability: Mastra tracing/evals (opt-in) for regression checks.

(Mastra provides agents + tools + workflows in TS, a dev server/playground, and tracing/evals so we can build testable, explainable pipelines.)  ￼

6.2 Data flows
	•	Real-time: odds:watch streams GRE updates from Player.log; compute deck state & odds. Untapped’s Companion does equivalent by “watching” Player.log when Detailed Logs are enabled.  ￼
	•	Batch: matches:stats, opponent:seen, collection:* read current & previous logs, then write CSV/JSON.

⸻

7) Requirements

Functional
	•	Implement commands listed in Feature Set with JSON/CSV/MD outputs suitable for dashboards.
	•	LLM outputs must validate against Zod schemas before printing.
	•	Provide --bulk to pre-load Scryfall cache; offline-first data path.

Non-Functional
	•	Node ≥20, modern TS build; Mastra integrated per docs (init, dev server, playground).
	•	Model routing: default OpenAI, switchable provider flag.

⸻

8) UX (CLI)
	•	Live mode: compact TTY table updating after each draw/play (odds, outs, opp-seen).
	•	Reports: --out to write CSV/MD; table summaries to stdout.
	•	LLM flags: --model, --max-steps, --trace, --provider, --memory.

⸻

9) Rollout
	1.	Alpha: collection:export, opponent:seen, odds:watch; LLM rate/brew.
	2.	Beta: matches:stats, rank:progress; LLM matchplan/explain; Limited helpers.
	3.	GA: tracing/evals + docs; optional “profiles” for preferred agents/models.

⸻

10) Risks & Mitigations
	•	No overlay UI → terminal+export only (explicit non-goal).
	•	No global meta → we won’t claim tier ranks; we’ll focus on your stats. (Untapped’s global stats/tier lists depend on crowd data.)  ￼
	•	Log variability → require Detailed Logs and document the macOS path; Untapped’s help center documents this toggle for their Companion as well.  ￼

⸻

11) Success Metrics
	•	Time-to-first insight (≤10s to render odds/watch after match start).
	•	≥95% of LLM brews pass legality & curve checks without manual edits.
	•	≥90% of sessions produce valid opponent-seen summaries.

⸻

12) Command Surface (initial)
	•	collection:export | collection:stats
	•	opponent:seen [--group-by match|card] | odds:watch
	•	matches:stats | rank:progress
	•	llm:rate | llm:brew | llm:explain | llm:matchplan | llm:draft | llm:limited-build

⸻

Sources (key references)
	•	Companion “during game” features (decklist access, draw odds, opponent cards played).  ￼
	•	Personal stats (ladder progression, deck performance, matchup stats).  ￼
	•	Draftsmith (pick ratings & auto-build).  ￼
	•	Collection CSV export (Premium / announcements & reviews).  ￼
	•	Global stats / tier lists rely on large aggregated datasets (not in scope for local CLI).  ￼
	•	Companion reads Player.log; enable Detailed Logs in Arena.  ￼

If you want, I’ll wire the first three commands (collection:export, opponent:seen, odds:watch) and scaffold the Mastra agents/workflows so you can start dogfooding right away.