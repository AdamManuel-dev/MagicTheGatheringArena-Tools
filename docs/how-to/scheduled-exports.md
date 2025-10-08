# Scheduled exports
Purpose: automate recurring collection exports and keep datasets current.

## Quick answer
Append this job to your crontab to run every night at 1:15 AM local time:
```bash
PROJECT_DIR=~/Projects/MagicTheGatheringArenaScripts
CMD='./bin/run collection:export --bulk --json --out cache/exports/nightly.json'
(crontab -l 2>/dev/null; \
  echo "15 1 * * * cd $PROJECT_DIR && $CMD") | crontab -
```

## Use a launchd agent on macOS
1. Create `~/Library/LaunchAgents/com.mtg.collection.export.plist` with:
   ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0"><dict>
     <key>Label</key><string>com.mtg.collection.export</string>
     <key>ProgramArguments</key>
    <array>
      <string>/bin/zsh</string>
      <string>-lc</string>
      <string>./bin/run collection:export --bulk --json --out cache/exports/nightly.json</string>
    </array>
    <key>WorkingDirectory</key><string>~/Projects/MagicTheGatheringArenaScripts</string>
     <key>StartCalendarInterval</key>
     <dict>
       <key>Hour</key><integer>1</integer>
       <key>Minute</key><integer>15</integer>
     </dict>
     <key>StandardOutPath</key><string>/tmp/mtga-collection-export.log</string>
     <key>StandardErrorPath</key><string>/tmp/mtga-collection-export.log</string>
   </dict></plist>
   ```
2. Load the agent:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.mtg.collection.export.plist
   ```
3. Confirm the next run:
   ```bash
   launchctl list | grep collection.export
   ```

## Refresh the Scryfall cache on demand
Run this task weekly to avoid stale names:
```bash
./bin/run collection:export --bulk --out cache/exports/nightly.csv
```
If the job fails, delete `cache/scryfall` and rerun to rebuild the cache.

## Error recovery
- `Exit status 1`: inspect `/tmp/mtga-collection-export.log` for log path errors.
- "Could not read Player.log": open MTG Arena once per day before the job runs.
- Empty JSON output: increase the ingest window with `--since 30d` or play new matches.

## Related tasks
- [Common tasks](common-tasks.md)
- [CLI commands](../reference/api.md)
