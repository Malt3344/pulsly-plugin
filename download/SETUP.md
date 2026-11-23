# Setting up Pulsly

You are setting up the content machine for someone who may never have used a terminal. Do all
the technical work yourself. Guide them like this:

- **One step at a time.** Start every message with where they are, e.g. "Step 2 of 5 — the
  video studio". Give them only that step, then wait until they say it is done.
- **Exact clicks.** Name every button and field exactly as it reads on screen, in **bold**,
  in numbered steps. Never "configure", "API" or "terminal" without saying what to click.
- **Check, then confirm.** After each step, check it worked yourself and say so ("✓ The voice
  works"). If something failed, say what to try next in one sentence.
- Use their language. Keep every message short.

Start with one message that says what is about to happen: "I'll set up Pulsly with you in 5
short steps, about 10 minutes. You'll only need to click a few things; I do the rest."

## Step 1 of 5 — Node.js

Run `node -v` yourself. If it prints v22 or higher, say "✓ Your computer is ready" and go on.

Otherwise ask them to:

1. Open **https://nodejs.org**.
2. Click the big **LTS** download button.
3. Open the file that downloads and click **Continue** / **Next** until it says it is done
   (on a Mac, type your computer password if asked).
4. Quit the Claude app completely (Mac: **Claude → Quit Claude**; Windows: close the window),
   open it again, open this folder in **Code**, and send **Set up Pulsly for me** once more.

Stop here until Node.js is installed.

## Step 2 of 5 — the video studio

Tell them: "I'm installing the video tools now. This takes 2–5 minutes; you don't need to do
anything." Then run:

```bash
cd studio && npm install
```

If `studio/.env` does not exist, copy `studio/.env.example` to `studio/.env`. When it is done:
"✓ The video studio is installed."

## Step 3 of 5 — connect Pulsly

Call `list_businesses`.

- If it works: "✓ Pulsly is connected" and list each business with its channels.
- If not, tell them:

  > 1. Type **/mcp** here in the chat and press Enter.
  > 2. Click **pulsly**, then **Authenticate**.
  > 3. Your browser opens Pulsly. Log in if asked, then click **Allow**.
  > 4. Come back here and write **done**.

  Then call `list_businesses` again.

If a business has no channels, ask them to open **https://app.pulsly.co/accounts** and connect
its TikTok, Instagram, Facebook or YouTube. If its brand kit is empty (no `about`), ask them to
fill it in at **https://app.pulsly.co/business**: Claude writes every video from it. These can
also wait until after setup.

## Step 4 of 5 — start videos automatically

Tell them: "Last technical bit: I'm adding a small helper that starts me the moment you order a
video in Pulsly." Then:

1. Call `create_helper_token` and write the token to `.pulsly-helper` in this folder.
2. The helper runs Claude from the command line. Run `claude --version`; if it is missing,
   install it with `npm install -g @anthropic-ai/claude-code`.
3. Test it from this folder:
   `claude -p "Call list_businesses and reply with only the number of businesses" --allowedTools mcp__pulsly`.
   If it says it is not logged in, run `claude setup-token` and tell them:

   > A browser window opens. Log in with the same Claude account and click **Authorize**.
   > Then come back here.

   Save the token it prints to `.pulsly-claude-token` in this folder (the helper passes it to
   Claude) and run the test again. If the test cannot reach the Pulsly tools, tell the user in
   one sentence that automatic start does not work on this computer yet and that they can say
   **Make my Pulsly videos** here after ordering; skip the rest of this step.

4. Make `helper.mjs` start on login and keep running, using the absolute path of `node`
   (`which node`, or `where node` on Windows), in this folder:
   - **macOS:** a LaunchAgent at `~/Library/LaunchAgents/co.pulsly.helper.plist` with
     `ProgramArguments` `[<node>, <this folder>/helper.mjs]`, `WorkingDirectory` this folder,
     `RunAtLoad` and `KeepAlive` true, and an `EnvironmentVariables` `PATH` that includes the
     folders of `node` and `claude` (`which claude`). Load it with
     `launchctl bootstrap gui/$(id -u) <plist>`.
   - **Windows:** a Task Scheduler task named "Pulsly helper" that runs at log on
     (`schtasks /Create /SC ONLOGON /TN "Pulsly helper" /TR "<node> \"<this folder>\helper.mjs\""`),
     then start it with `schtasks /Run /TN "Pulsly helper"`.
   - **Linux:** a systemd user service `pulsly-helper` (`systemctl --user enable --now`).
5. Check that `pulsly-helper.log` says "Pulsly helper started.", then say "✓ Videos now start
   by themselves when you order them".

Remove old tasks from earlier versions first if they exist (`co.pulsly.autopilot`, "Pulsly
autopilot", a `# pulsly-helper` crontab line). To stop the helper later, the user says "Stop the
Pulsly helper" and you remove it.

## Step 5 of 5 — your voice and your first video

Tell them, in this order:

> 🎉 Pulsly is ready. One last thing for the best videos: your own voice.
>
> 1. Open **https://app.pulsly.co/settings#voice** and follow the 4 short steps there (an
>    ElevenLabs account, then paste its key). Pick the voice you like; you can listen to each.
>    Without it, videos use a free voice that sounds more robotic.
>
> Then make your first video:
>
> 1. Open **https://app.pulsly.co/studio**.
> 2. Pick a style, write one line about what the video is about, and click **Make the video**.
> 3. I start within seconds. A video takes me about 20–40 minutes.
> 4. When it says **Ready to review**, click **Watch the video**. Nothing is posted until you
>    approve it there.
>
> Want new videos every week without lifting a finger? Turn on **Content engine** in Pulsly.
>
> Keep your computer on and awake while I work. You can close this window; I run in the
> background.
