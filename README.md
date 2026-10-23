# Pulsly for Claude Code

Turn an idea into a motion-graphics reel with your own Claude subscription and a free voice, then
post it to TikTok, Instagram, Facebook and YouTube with [Pulsly](https://pulsly.co).

## Install

1. In Claude Code:

   ```
   /plugin marketplace add Malt3344/pulsly-plugin
   /plugin install pulsly@pulsly
   ```

2. Connect your Pulsly account: run `/mcp`, choose **pulsly** → **Authenticate**, log in and
   click **Allow**. No API keys, and no usage beyond your Claude plan.

3. Ask for a video:

   ```
   /pulsly:make-reel a reel about why agencies should sell outcomes, not tools
   ```

Requirements: Claude Code, Node 22+ and a [Pulsly](https://pulsly.co) account. The voice
([Kokoro](https://huggingface.co/hexgrad/Kokoro-82M), Apache 2.0) runs on your computer for free.

## What's inside

| Path               | What it is                                                        |
| ------------------ | ----------------------------------------------------------------- |
| `skills/make-reel` | The workflow: script → voice → scenes → render → post             |
| `studio`           | Remotion template that renders `video.json` into a 1080×1920 reel |
| `.mcp.json`        | Connects Claude Code to the Pulsly API (`api.pulsly.co/mcp`)      |

The studio is copied to `./pulsly-studio` the first time you make a reel. Preview and tweak any
video in the browser with `npm run studio`.

## Pulsly tools

| Tool                    | What it does                                          |
| ----------------------- | ----------------------------------------------------- |
| `list_channels`         | Your connected channels                               |
| `create_media_upload`   | Returns a URL to upload a video or image to           |
| `complete_media_upload` | Confirms the upload                                   |
| `schedule_post`         | Publishes now or at a set time to the chosen channels |
| `list_posts`            | Recent posts and their status per channel             |
