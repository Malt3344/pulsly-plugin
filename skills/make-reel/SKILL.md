---
name: make-reel
description: Turn an idea into a 9:16 motion-graphics reel (dark background, bold headline with highlighted words, UI cards synced to a voiceover) and post it to the user's TikTok, Instagram, Facebook and YouTube channels through Pulsly. Use when the user wants to make, render or post a reel, short or TikTok video.
---

# Make a reel

You write the script, plan the scenes, render the video locally with Remotion and post it with
the Pulsly MCP tools. Work through the steps in order and keep the user in the loop at the two
checkpoints (script, rendered video).

## 1. Set up the studio (first time only)

The studio lives in `./pulsly-studio` in the current folder. If it does not exist:

```bash
rsync -a --exclude node_modules "${CLAUDE_PLUGIN_ROOT}/studio/" ./pulsly-studio/
cd pulsly-studio && npm install && cp .env.example .env
```

The voice is Kokoro, a free open-source voice that runs on this computer: no account or key.
The default is `am_michael`; the user can pick another in `pulsly-studio/.env` (for example
`am_adam`, `af_heart`, `bm_george`).

If the Pulsly tools (`list_channels` and the others) are not available, ask the user to run
`/mcp`, choose **pulsly** → **Authenticate**, log in to Pulsly in the browser and click
**Allow**. There are no keys to copy.

## 2. Write the script — checkpoint

Pick a short slug for the video (e.g. `sell-the-job`). Write the voiceover to
`pulsly-studio/public/videos/<slug>/script.txt` and show it to the user before continuing.

The style that works:

- **25–45 seconds**, 70–120 words. Spoken, plain words, short sentences.
- **Hook in the first 2 seconds**: a bold claim or reversal ("Stop selling AI tools. Sell the
  job."). No greeting, no "in this video".
- **One idea per sentence**, each building on the last: problem → reframe → proof → how.
- Concrete numbers and nouns beat adjectives ("screened 212 applicants" not "saves time").
- **End with one call to action** built on a single keyword: "Comment JOB and I'll send you the
  playbook."

## 3. Record the voice

```bash
cd pulsly-studio && npm run voice -- <slug>
```

This writes `voice.wav` and `words.json` (every word with `start` and `end` in seconds) next to
the script. The first run downloads the voice model (~90 MB).

## 4. Plan the scenes

Read `words.json` and split it into scenes of **2–4 seconds**, one per sentence or phrase. A
scene's `start` is the `start` of its first word; its `end` is the `start` of the next scene (the
last scene ends 0.4 s after the last word). Scenes must not overlap or leave gaps.

Write `pulsly-studio/public/videos/<slug>/video.json`. Do not add `audio` or `words`; the render
script adds them. Set `"style": "light"` for a clean, bright look (pair it with a darker accent such
as `#2563eb`) or leave it out for the default dark style.

```json
{
  "accent": "#3fe0b0",
  "scenes": [
    {
      "start": 0,
      "end": 2.6,
      "title": { "text": "Stop selling AI tools. Sell the job.", "highlight": ["the", "job."] }
    },
    {
      "start": 2.6,
      "end": 5.9,
      "title": { "text": "Your agents do the work", "highlight": ["work"] },
      "visuals": [
        {
          "type": "terminal",
          "header": "MONTHEND · OPS",
          "status": "AGENTS RUNNING · 4",
          "lines": [
            { "text": "screened 212 applicants", "time": "00:41" },
            { "text": "booked 9 sales calls", "time": "03:05", "badge": "LIVE" }
          ]
        }
      ]
    }
  ]
}
```

Rules for a scene:

- `title.text` is what the voice says in that scene, trimmed to **at most 8 words**. Its words
  pop in as they are spoken, so keep them in spoken order. Highlight **1–2 key words**
  (`highlight` lists them exactly as written, punctuation included).
- Up to 3 `visuals`, stacked under the title. Use one when it shows what is being said, and leave
  every third scene or so with only a title to let the video breathe:

| type        | Fields                                                    | Use it for                             |
| ----------- | --------------------------------------------------------- | -------------------------------------- |
| `tag`       | `label`                                                   | Naming a category: "software company"  |
| `sticker`   | `name`, optional `top` / `subtitle` (HELLO / my name is)  | Identity and reframes: "services firm" |
| `terminal`  | `header`, `status`, `lines[]` (`text`, `time?`, `badge?`) | Agents, automation, work getting done  |
| `stat`      | `value` (number), `prefix`, `suffix`, `label`             | One number that counts up: "$12k"      |
| `checklist` | `items[]` (1–5)                                           | Steps, requirements, what you get      |
| `cta`       | `keyword`, `text`                                         | Last scene only, with no title         |

- Use the default accent unless the user has a brand colour.

## 5. Render — checkpoint

```bash
cd pulsly-studio && npm run render -- <slug>
```

The video is written to `public/videos/<slug>/reel.mp4`. Tell the user where it is and that they
can preview and fine-tune it in the browser with `npm run studio`. Wait for their go-ahead before
posting.

## 6. Post with Pulsly

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
3. Make each video with steps 2–5, one slug per video (e.g. `week-1-mon`). Show the scripts
   together for one approval instead of stopping for each.
4. Schedule them one per day at the chosen time with `schedule_post`, then report the
   schedule as a short list (day, hook, channels).
