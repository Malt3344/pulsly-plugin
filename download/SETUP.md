# Setting up Pulsly

Do these steps for the user, in order. Keep it friendly and short; explain only what they have
to do themselves.

## 1. Check Node.js

Run `node -v`. If it fails or the version is below 22, ask the user to install Node.js LTS
from https://nodejs.org (download, double-click, next, next), then to restart Claude and say
"Set up Pulsly for me" again. Stop here until Node is installed.

## 2. Install the studio

```bash
cd studio && npm install
```

If `studio/.env` does not exist, copy `studio/.env.example` to `studio/.env`. This can take a
few minutes the first time; tell the user it is downloading the video tools.

## 3. Connect Pulsly

Check whether the Pulsly tools are available by calling `list_businesses`.

- If it works, show each business with its channels.
- If not, ask the user to type `/mcp`, choose **pulsly**, then **Authenticate**. Their browser
  opens Pulsly: they click **Allow**. Then call `list_businesses` again.
- If a business has no channels yet, ask the user to connect its TikTok, Instagram, Facebook or
  YouTube in Pulsly under **Channels**. If its brand kit is empty (no `about`), ask them to fill
  it in under **Brand kit** in Pulsly: Claude writes every video from it.

## 4. Start the Pulsly helper

Set up a task on the user's computer that runs every hour and makes the videos they order in
Pulsly. It runs in this folder:

```
claude -p "pulsly-helper: make the videos ordered in Pulsly" --allowedTools Bash Read Write Edit mcp__pulsly
```

Append its output to `pulsly-helper.log` in this folder.

- **macOS:** a LaunchAgent at `~/Library/LaunchAgents/co.pulsly.helper.plist` that runs
  `/bin/zsh -lc "cd '<this folder>' && …"` with `StartInterval` 3600, then `launchctl load` it.
- **Windows:** a Task Scheduler task named "Pulsly helper" (`schtasks /Create /SC HOURLY …`)
  that runs the command in this folder.
- **Linux:** a crontab line `0 * * * *` tagged `# pulsly-helper`.

If a helper task already exists, leave it. Tell the user in one sentence: while the computer is
on, Claude checks Pulsly every hour and makes the videos they order there. To stop it, they can
say "Stop the Pulsly helper" and you remove the task.

## 5. Done

Tell the user the content machine is ready:

- In Pulsly under **Videos**, they pick the business, a style and what the videos are about,
  how many, and whether to approve them first, schedule them or post them right away. Claude
  makes them within the hour, or straight away if they say "Make my Pulsly videos" here.
- **Autopilot** in the same form orders a new batch every week.
- They can also just ask here, for example "Make a video about <their product>".
