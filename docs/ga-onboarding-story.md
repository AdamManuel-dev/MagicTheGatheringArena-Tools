# GA onboarding story
Purpose: describe end-to-end onboarding for GA users enabling advanced features.

## Step 1: Install and configure
- Install Node 20+, clone repo, run `npm install`
- Enable Detailed Logs in MTGA following setup guide
- Configure provider credentials via `.env` template (`MASTRA_PROVIDER`, API keys)

## Step 2: Initialize profiles
- Run `./bin/run profile:init --name default`
- Set default provider/model preferences, telemetry opt-in choice, and preferred output format

## Step 3: Data readiness
- Run `./bin/run extract --bulk --out collection.csv`
- Execute `./bin/run opponent:seen --group-by card --since 7d`
- Start background watcher `./bin/run odds:watch --follow`

## Step 4: Advanced features
- Launch analytics pipeline `./bin/run matches:stats --out reports/matches.json`
- Generate rank progression `./bin/run rank:progress --json --out reports/rank.json`
- Invoke `./bin/run llm:brew --format standard --profile default`
- Use `./bin/run llm:matchplan --opponent archetype.json --profile default`

## Step 5: Observability and support
- Enable tracing: `./bin/run config:set --key tracing.enabled --value true`
- Review telemetry summary `./bin/run metrics:summary`
- Consult troubleshooting doc for common issues; escalate via GitHub Discussions

## Success criteria
- User completes setup inside 30 minutes
- At least one live match tracked with odds updates <10s
- First brew generated without manual legality fixes
- Metrics recorded when opt-in enabled
