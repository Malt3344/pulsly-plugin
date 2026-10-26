---
name: make-reel
description: Turn an idea into a 9:16 motion-graphics reel (dark background, bold headline with highlighted words, UI cards synced to a voiceover) and post it to the user's TikTok, Instagram, Facebook and YouTube channels through Pulsly. Use when the user wants to make, render or post a reel, short or TikTok video.
---

# Make a reel

You write the script, plan the scenes, check your own work, render the video locally with
Remotion and post it with the Pulsly MCP tools. The quality bar is a reel a good editor would be
proud of: a hook that stops the scroll, a new visual every 2–3 seconds, nothing cramped or
cut off. Work through the steps in order and keep the user in the loop at the two checkpoints
(script, rendered video).

## 1. Set up the studio and brand kit

The studio lives in `./pulsly-studio` in the current folder. If it does not exist:

```bash
rsync -a --exclude node_modules "${CLAUDE_PLUGIN_ROOT}/studio/" ./pulsly-studio/
cd pulsly-studio && npm install && cp .env.example .env
```

If it exists but its `package.json` version is lower than
`${CLAUDE_PLUGIN_ROOT}/studio/package.json`, update the code and keep the user's files:

```bash
rsync -a --exclude node_modules --exclude public --exclude brand.json --exclude .env \
  "${CLAUDE_PLUGIN_ROOT}/studio/" ./pulsly-studio/ && (cd pulsly-studio && npm install)
```

**Brand kit.** If `pulsly-studio/brand.json` does not exist, ask once for the brand name, the
social handle (e.g. `@pulsly`), a brand colour and whether they prefer the `dark` or `light`
look, and write it (see `brand.example.json`). Every video uses it automatically. Ask them to
drop real product screenshots into `pulsly-studio/public/brand/`: real screens are the
biggest quality upgrade.

The voice is Kokoro, a free open-source voice that runs on this computer: no account or key.
The default is `am_michael`; the user can pick another in `pulsly-studio/.env` (for example
`am_adam`, `af_heart`, `bm_george`).

If the Pulsly tools (`list_channels` and the others) are not available, ask the user to run
`/mcp`, choose **pulsly** → **Authenticate**, log in to Pulsly in the browser and click
**Allow**. There are no keys to copy.

## 2. Write the script — checkpoint

Pick a short slug for the video (e.g. `sell-the-job`). Write the voiceover to
`pulsly-studio/public/videos/<slug>/script.txt` and show it to the user before continuing.

**Structure** (20–40 seconds, 60–110 words):

1. **Hook, 0–2 s.** One line that makes the viewer stay. Patterns that work:
   - Reversal: "Stop selling AI tools. Sell the job."
   - Enemy: "Posting to four apps is killing your week."
   - Specific result: "One founder went from 2 posts a month to 30."
   - Mistake: "The pricing page mistake almost every SaaS makes."
2. **Problem** the viewer recognises, in their words.
3. **Reframe or insight**: the one idea of the video.
4. **Proof**: a number, a before/after, a customer quote or the product on screen.
5. **How**: two or three concrete steps.
6. **One call to action** on a single keyword: "Comment POST and I'll send you the setup."

**Writing rules:** spoken words, sentences under 12 words, one idea per sentence. Numbers and
nouns beat adjectives ("screened 212 applicants", not "saves time"). No greeting, no "in this
video", no filler ("basically", "so yeah").

## 3. Record the voice

```bash
cd pulsly-studio && npm run voice -- <slug>
```

This writes `voice.wav` and `words.json` (every word with `start` and `end` in seconds) next to
the script. The first run downloads the voice model (~90 MB).

## 4. Plan the scenes

Read `words.json` and split it into scenes of **1.5–3.5 seconds**: one per sentence, and split
long sentences. Fast cuts keep people watching. A scene's `start` is the `start` of its first
word; its `end` is the `start` of the next scene (the last scene ends 0.4 s after the last
word). Scenes must not overlap or leave gaps.

Write `pulsly-studio/public/videos/<slug>/video.json`. Do not add `audio` or `words` (the
scripts add them) or `style`, `accent` and `handle` (they come from `brand.json`, unless this
video should differ).

```json
{
  "scenes": [
    {
      "start": 0,
      "end": 3.4,
      "title": { "text": "Posting to 4 apps is killing your week", "highlight": ["killing"] },
      "visuals": [
        {
          "type": "notifications",
          "items": [
            { "app": "TikTok", "text": "Upload failed. Try again", "time": "9:02" },
            { "app": "YouTube", "text": "Add a title to publish", "time": "9:31" }
          ]
        }
      ]
    }
  ]
}
```

**Scene rules**

- `title.text` is what the voice says in that scene, trimmed to **at most 8 words**, in spoken
  order (words pop in as they are spoken). Write numbers as digits ("4 apps"). Highlight **1–2
  key words**, exactly as written including punctuation.
- **Every scene gets a visual** that shows what is being said, except a short punchy line now
  and then that works better alone. Usually one visual per scene; never more than two.
- **Never use the same visual type twice in a row**, and use at least four different types in a
  video.
- The `cta` scene has no title. Captions appear automatically in scenes without a title.

| type            | Fields                                                                                 | Use it for                              |
| --------------- | -------------------------------------------------------------------------------------- | --------------------------------------- |
| `image`         | `src` (in `public/`, e.g. `brand/app.png`), `frame` (`browser`/`phone`/`none`), `url?` | The real product: the strongest proof   |
| `notifications` | `items[]` (`app`, `text`, `time?`), 1–4                                                | Pain ("Upload failed") or wins ("+$49") |
| `compare`       | `before` / `after` (`title`, `items[]` 1–4)                                            | Old way vs. new way                     |
| `chart`         | `kind` (`line`/`bar`), `values[]` 2–12, `label`, `prefix`, `suffix`                    | Growth and results over time            |
| `stat`          | `value` (number), `prefix`, `suffix`, `label`                                          | One big number that counts up           |
| `quote`         | `text`, `author`, `role?`                                                              | A customer saying it for you            |
| `terminal`      | `header`, `status`, `lines[]` (`text`, `time?`, `badge?`)                              | Automation, agents, work getting done   |
| `checklist`     | `items[]` (1–5)                                                                        | Steps, what you get                     |
| `tag`           | `label`                                                                                | Naming a category or audience           |
| `sticker`       | `name`, `top?`, `subtitle?` ("HELLO / my name is")                                     | Identity and reframes                   |
| `cta`           | `keyword`, `text`                                                                      | Last scene only                         |

Only use an `image` that exists. Never invent numbers, customers or quotes: use what the user
gave you, or ask.

## 5. Check your work

```bash
cd pulsly-studio && npm run preview -- <slug>
```

This renders `public/videos/<slug>/preview.jpg`: one still per scene. **Open it and look at
every tile.** Fix `video.json` and run the preview again until all of these hold:

- No text is cut off, overlapping, or too small to read on a phone.
- Every title shows all its words and highlights the right ones.
- No two neighbouring scenes look alike, and no scene is empty or cramped.
- The first tile alone would make someone stop scrolling.

## 6. Render — checkpoint

```bash
cd pulsly-studio && npm run render -- <slug>
```

The video is written to `public/videos/<slug>/reel.mp4`. Tell the user where it is and that they
can fine-tune it in the browser with `npm run studio`. Wait for their go-ahead before posting.

## 7. Post with Pulsly

1. `list_channels` and ask which channels to post to (default: all active ones) and when (now or
   a date and time — convert it to ISO 8601 with the user's timezone).
2. Upload the video:
   - Get the size with `wc -c < public/videos/<slug>/reel.mp4`.
   - `create_media_upload` with `filename: "<slug>.mp4"`, `contentType: "video/mp4"` and the size.
   - `curl -sS -X PUT -H "Content-Type: video/mp4" --data-binary @public/videos/<slug>/reel.mp4 "<uploadUrl>"`
   - `complete_media_upload` with the `mediaId`.
3. Write a caption: the hook as the first line, one or two lines of value, the call to action and
   3–5 relevant hashtags. Write a YouTube title of at most 100 characters (the hook works well).
4. `schedule_post` with the channel ids, the media id, the caption, the title and `scheduledAt`
   (omit it to publish now).
5. Report what was scheduled. If the result has a `tiktokDraft`, give the user the `reviewUrl`:
   TikTok requires them to choose the post's visibility in Pulsly before it can go out.

Use `list_posts` to check on progress when the user asks.

## A batch of videos

When the user asks for several videos (for example "a week of explainer videos about my
product"):

1. Ask once for what the videos are about (product, audience, offer), the channels and the
   posting time, and whether to use the `dark` or `light` style.
2. Propose one idea per video as a numbered list of hooks and get a single go-ahead.
3. Make each video with steps 2–6, one slug per video (e.g. `week-1-mon`). Show the scripts
   together for one approval instead of stopping for each.
4. Schedule them one per day at the chosen time with `schedule_post`, then report the
   schedule as a short list (day, hook, channels).

## Autopilot

A request that starts with `autopilot:` comes from a scheduled run with nobody watching
(set up on the Videos page in Pulsly). Then:

- Never ask questions or wait for approval; the checkpoints in steps 2 and 6 are skipped, but
  always do the check in step 5.
- Use the channels, style, number of videos and posting time from the request. Pick a fresh
  angle for each video: check `list_posts` and avoid repeating recent hooks.
- Set up the studio if `./pulsly-studio` does not exist yet.
- Schedule every video as asked. TikTok channels come back as drafts; that is expected.
- End with a short summary (day, hook, channels) so the log shows what was made. If something
  fails, stop and explain it in the log instead of retrying endlessly.
