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

The helper (`helper.mjs` in this folder) runs in the background and starts Claude the moment
the user orders a video in Pulsly. It checks Pulsly every 20 seconds without using any of the
user's Claude plan; Claude only runs when there is something to make.

1. Call `create_helper_token` and write the token to `.pulsly-helper` in this folder.
2. Make it start on login and keep running, with `node` from `which node` (or `where node`) as
   an absolute path, in this folder:
   - **macOS:** a LaunchAgent at `~/Library/LaunchAgents/co.pulsly.helper.plist` with
     `ProgramArguments` `[<node>, <this folder>/helper.mjs]`, `WorkingDirectory` this folder,
     `RunAtLoad` and `KeepAlive` true, and an `EnvironmentVariables` `PATH` that includes the
     folders of `node` and `claude` (`which claude`). Then
     `launchctl bootstrap gui/$(id -u) <plist>`.
   - **Windows:** a Task Scheduler task named "Pulsly helper" that runs at log on, hidden
     (`schtasks /Create /SC ONLOGON /TN "Pulsly helper" /TR "<node> \"<this folder>\helper.mjs\""`),
     then start it once with `schtasks /Run /TN "Pulsly helper"`.
   - **Linux:** a systemd user service `pulsly-helper` (`systemctl --user enable --now`).
3. Check that `pulsly-helper.log` says "Pulsly helper started."

If an old hourly task from an earlier version exists (`co.pulsly.autopilot`, "Pulsly
autopilot", `# pulsly-helper` in crontab, or `co.pulsly.helper` with `StartInterval`), remove
it first. Tell the user in one sentence: while the computer is on, Claude starts on its own
within seconds of an order in Pulsly. To stop it, they say "Stop the Pulsly helper" and you
remove the service.

## 5. Done

Tell the user the content machine is ready:

- In Pulsly under **Videos**, they pick the business, a style and what the videos are about,
  how many, and whether to approve them first, schedule them or post them right away. Claude
  makes them within the hour, or straight away if they say "Make my Pulsly videos" here.
- **Autopilot** in the same form orders a new batch every week.
- They can also just ask here, for example "Make a video about <their product>".
