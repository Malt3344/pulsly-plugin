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

## 3. Brand kit

If `studio/brand.json` does not exist, ask the user in one message for:

- their brand or product name,
- their social handle (e.g. `@pulsly`),
- a brand colour (a hex code, or describe it and pick one),
- a `dark` or `light` look,

then write `studio/brand.json` like `studio/brand.example.json`. Tell them they can drop product
screenshots into `studio/public/brand/` any time to use in videos.

## 4. Connect Pulsly

Check whether the Pulsly tools are available by calling `list_channels`.

- If it works, show the connected channels.
- If not, ask the user to type `/mcp`, choose **pulsly**, then **Authenticate**. Their browser
  opens Pulsly: they click **Allow**. Then call `list_channels` again.
- If they have no channels yet, ask them to connect TikTok, Instagram, Facebook or YouTube in
  Pulsly under **Channels** first.

## 5. Done

Tell the user the content machine is ready, and suggest their first message, for example:

> Make a video about my product: <one line about what they sell>

Videos wait for their approval in Pulsly under **Posts → Needs review**. Mention that they can
also ask for a week of videos at once, or say "Turn on autopilot" to get new videos every week.
