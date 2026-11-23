---
name: make-reel
description: Turn an idea into a high-retention 9:16 reel — motion graphics, 3D, paper, blocky 3D stories, story-over-gameplay, text chats or quizzes, voiced, captioned, with music and sound effects — and post it to the user's TikTok, Instagram, Facebook and YouTube channels through Pulsly. Use when the user wants to make, render or post a reel, short, TikTok or explainer video, or a batch of them.
---

# Make a reel

You are the scriptwriter, motion designer and editor. You write the script, design a custom
illustration for every moment, animate it to the voice in code, check your own work frame by
frame and post it with the Pulsly MCP tools.

**The bar:** a reel that keeps people watching to the end, like the best faceless explainer
channels. That means:

- **Something new happens at least every second.** A word appears, a row slides in, a
  number counts, a stamp slams, a cursor clicks. Never a still frame for more than 1.2 s.
- **Picture on its word.** Every change lands on the exact word that is spoken.
- **The illustration is the star.** A big, detailed, realistic visual fills the frame; the
  headline at the top is small.
- **Illustrations live and evolve.** One visual stays for its shot and gets built up,
  annotated, crossed out or stamped as the sentence goes on, then the next shot cuts in.

Keep the user in the loop at two checkpoints: the script, and the finished video.

## 1. Set up the studio and brand kit

**Where the studio is.** In a downloaded Pulsly folder, the studio is the `studio` folder in
the current folder: use it in place. Otherwise (the Pulsly plugin) it lives in `./pulsly-studio`;
if that does not exist, create it:

```bash
rsync -a --exclude node_modules "${CLAUDE_PLUGIN_ROOT}/studio/" ./pulsly-studio/
```

Below, `<studio>` means whichever of the two folders it is.

If `<studio>/node_modules` does not exist, run `cd <studio> && npm install` (Node.js 22 or later
is needed: if `node -v` fails, ask the user to install the LTS version from https://nodejs.org
and restart Claude). If `<studio>/.env` does not exist, copy `.env.example` to it.

In the plugin, if `./pulsly-studio/package.json` has a lower version than
`${CLAUDE_PLUGIN_ROOT}/studio/package.json`, update the code and keep the user's files:

```bash
rsync -a --exclude node_modules --exclude public/videos --exclude public/brand \
  --include 'src/videos/example*' --exclude 'src/videos/*' --exclude brand.json --exclude .env \
  "${CLAUDE_PLUGIN_ROOT}/studio/" ./pulsly-studio/ && (cd pulsly-studio && npm install)
```

**Business and brand kit.** Every video is for one of the user's businesses. Call
`list_businesses`: each has a brand kit (`name`, `website`, `about` — what it sells and to
whom —, `handle`, `accent`) and its own channels. If there is more than one and the request
does not say which, ask. Write the video's brand kit to
`<studio>/public/videos/<slug>/brand.json` as `{ "name", "handle", "accent", "style" }`.

**Style.** Every video has one of seven styles (ask, or use the one from the order). Three are
drawn shot by shot with the kit:

- `explainer3d` — **3D explainer.** Each shot is a 3D scene in dark space under a spotlight
  (`<Stage3D>` as the shot's `scene`, with `Pedestal`, `Block`, `Orb`, `Screen`, `Pillar`,
  `Coin`, `Burst`), and the headline runs as captions at the bottom with the spoken word
  boxed. Move the camera differently in every shot. Best for "how it works" and big ideas.
- `paper` — **Paper + presenter.** Warm paper, a chapter label, a left-aligned headline whose
  highlighted words turn into accent serif italics, and a cartoon presenter in the corner who
  talks along and gestures at every sentence. Product cards and screens float on the paper.
  Best for advice, stories and opinions. Leave the bottom right free for the presenter.
- `motion` — **Motion graphics.** Bold product screens, numbers and stamps on dark and light
  shots. Best for product walkthroughs and results.

Four are **templates**: you fill one typed spec and the template animates it, so they always look
exactly like the style. Read `templates.md` next to this skill for them:

- `blocky` — **Blocky 3D story.** Blocky toy characters act the story out in bright 3D game worlds
  (park, city, school, house, obby, beach, space, shop), with game captions, speech bubbles and
  cartoon effects. Best for stories and lessons with a twist.
- `gameplay` — **Story + gameplay.** The story is told over a 3D parkour run with big captions and
  the title on a post card. Best for storytime, confessions and drama.
- `chat` — **Text chat.** A message thread that plays out with the voice. Best for funny or
  dramatic exchanges and objections.
- `quiz` — **Quiz.** Trivia with a countdown and the answer revealed on its word, or "would you
  rather" with the results. Best for engagement.

Write the script from `about`; if it is empty, ask what the business sells and suggest filling in
the brand kit in Pulsly. Real product screenshots in `<studio>/public/brand/` make the best proof
in the kit styles: ask for them.

The voice is the user's own ElevenLabs account, connected in Pulsly (**Settings → Voice**, where
they also pick the voice), with the free local Kokoro voice as a fallback. Music is generated on
install and the sound effects are CC0 recordings; there is nothing to license.

If the Pulsly tools (`list_channels` and the others) are not available, ask the user to type
`/mcp`, choose **pulsly** → **Authenticate**, log in and click **Allow**.

## 2. Write the script — checkpoint

Pick a short slug (e.g. `sell-the-job`). Write the voiceover to
`<studio>/public/videos/<slug>/script.txt` and show it to the user.

- **Length:** 35–60 seconds for an explainer (110–170 words); 20–30 seconds for a quick tip.
- **Hook in the first second:** the first frame is the thumbnail and the first five words
  decide everything. Open with chaos or a contrast on screen (notifications flooding in, a
  number exploding, something being crossed out), never a calm title. Patterns:
  reversal ("Stop selling AI tools. Sell the job."), enemy ("Posting to four apps is
  killing your week."), specific result ("5 million views in 35 days."), secret ("The
  secret isn't Claude."), mistake ("The pricing mistake almost every SaaS makes.").
- **Keep an open loop:** promise the payoff early ("…and the third one is the one nobody
  uses") and pay it off late. Add a twist halfway ("But here's the catch").
- **Structure:** hook → the problem in the viewer's words → the insight (one idea) →
  proof (numbers, a customer, the product on screen) → how (2–3 concrete steps) → one call
  to action on a keyword ("Comment POST and I'll send you the setup").
- **Write for the ear and the eye:** sentences under 12 words; concrete nouns and numbers
  that can be _shown_ ("screened 212 applicants", not "saves time"); no greeting, no filler.
- Never invent numbers, customers or quotes. Use what the user gave you, or ask.

## 3. Record the voice

Call `record_voice` with the script's text. Pulsly records it with the user's own ElevenLabs
voice and returns `voiceUrl` and `wordsUrl`; download both:

```bash
cd <studio> && rm -f public/videos/<slug>/voice.wav && \
  curl -sSf -o public/videos/<slug>/voice.mp3 "<voiceUrl>" && \
  curl -sSf -o public/videos/<slug>/words.json "<wordsUrl>"
```

`words.json` has every word's `start`/`end` seconds; everything is timed to it.

If `record_voice` fails, it says why. No key yet: tell the user in one sentence that videos
sound far better with their own voice and that they connect it in Pulsly → **Settings → Voice**
(two minutes); out of credits: say so. Then record the free local voice instead (`voice.wav`,
~90 MB model on the first run):

```bash
cd <studio> && npm run voice -- <slug>
```

In an unattended run, never wait: fall back to the local voice and mention it in the summary.

## 4. Plan the beats

**Template styles** (`blocky`, `gameplay`, `chat`, `quiz`): read `templates.md` and the style's
example, then plan the spec instead of shots: which scene, actors, effects and camera go on which
words (`blocky`), the messages (`chat`), the rounds and reveals (`quiz`) or the title
(`gameplay`). Then write the video as in step 5 and continue at step 6.

**Kit styles:** read `words.json` and the script, then write a beat sheet (in your head or a
scratch file):

1. **Shots.** Group the script into shots of one or two sentences (2–5 s each). Each shot
   has one illustration idea: a product screen, a metaphor (a vault for "the secret", a
   funnel for "customers", a treadmill for "running in place"), a data visual, or a reframe.
   Never repeat an idea in two shots in a row. Alternate `dark` and `light` shots every one
   to three shots for contrast.
2. **Beats.** For every shot, list which word triggers which change. Aim for a beat every
   0.5–1 s: elements appearing, rows filling in, numbers counting, a highlight box, a red
   strike-through, a stamp, a cursor click, a check mark. Put the biggest beat on the most
   important word.
3. **Density.** Mockups should look real and full: 4–8 rows in a table, real-looking names,
   amounts, dates, avatars, platform logos, icons. Sparse boxes look cheap.

## 5. Write the video in code

For a template style, copy its example (`example-blocky.tsx`, `example-gameplay.tsx`,
`example-chat.tsx` or `example-quiz.tsx`) to `<studio>/src/videos/<slug>.tsx`, fill in the spec
from your plan and run `npm run check`.

For a kit style, read `kit.md` next to this skill (the components) and the finished example of
the video's style first: `<studio>/src/videos/example-3d.tsx`, `example-paper.tsx` or
`example.tsx` (motion). Then write
`<studio>/src/videos/<slug>.tsx`:

```tsx
import { Appear, Shot, Stamp, Video, Window, type VideoProps } from '../kit';

export default function SellTheJob(props: VideoProps) {
  return (
    <Video props={props}>
      <Shot
        from={0}
        headline={{ text: 'Stop selling AI tools. Sell the job.', highlight: ['job.'] }}
      >
        {/* … */}
      </Shot>
      <Shot
        from="Nobody"
        tone="light"
        headline={{ text: 'Nobody wants another tool', highlight: ['tool'] }}
      >
        {/* … */}
      </Shot>
    </Video>
  );
}
```

- The first shot starts `from={0}`; every other shot starts on its first spoken word
  (`from="Nobody"`). Shots run until the next one starts.
- Trigger changes with `on="word"` (the first time the word is said in that shot), or
  `on={{ word: 'four', nth: 2 }}`, plus `delay` in frames (30 per second) to stagger.
- The first frame is the thumbnail: the first shot must show a strong visual at once (no
  `on` on its main element).
- Each shot's main object is on screen as the shot cuts in; cue the _changes_ to it, not
  the object itself. Shots cut in over each other full screen (`push`, `zoom`, `wipe`,
  `whip`, rotating by default) with a whoosh, so don't add your own fades.
- One focal motion at a time: stagger beats with `delay` instead of moving everything at
  once, so the eye always knows where to look.
- You can write your own small components and SVG drawings in the file for custom
  illustrations; use `useCue` for timing and `useColors` for colours.

Then run `npm run check` and fix any type errors.

## 6. Check your work

```bash
cd <studio> && npm run preview -- <slug>
```

Renders `public/videos/<slug>/preview-1.jpg`, `-2.jpg`…: a still every second. **Open every
page and look at every tile.** To look closer at a moment, add seconds:
`npm run preview -- <slug> 3.5 8` renders `still-3.5.jpg` and `still-8.jpg` at half size. Fix the
video and preview again until:

- The first tile alone would stop someone scrolling.
- Neighbouring tiles always differ: something new every second.
- Nothing is cut off, overlapping, too small to read on a phone, or empty.
- The headline shows the right words and highlights; the visual matches what is said.
- Template styles: every effect, reveal, message and bubble lands on its word, and faces and
  signs are readable.

## 7. Render — checkpoint

```bash
cd <studio> && npm run render -- <slug>
```

Renders `public/videos/<slug>/reel.mp4` with music and sound effects, levels the sound to
-14 LUFS, and runs a **motion check** that lists every stretch longer than 1.2 s where
nothing new happens. Add beats there and render again until the check is clean. Then tell
the user where the video is (they can fine-tune it with `npm run studio`) and wait for their
go-ahead before posting.

## 8. Send it to Pulsly for review

Videos never go straight to the socials: they wait in Pulsly until the user has watched them
and pressed approve.

For videos ordered in Pulsly, use `deliver_video` instead (see below). Otherwise:

1. Take the business's channels from `list_businesses` and ask which to post to (default: all
   active ones) and when (now or a date and time — convert it to ISO 8601 with the user's
   timezone). Never mix channels of two businesses in one post.
2. Upload the video:
   - Get the size with `wc -c < public/videos/<slug>/reel.mp4`.
   - `create_media_upload` with `filename: "<slug>.mp4"`, `contentType: "video/mp4"` and the size.
   - `curl -sS -X PUT -H "Content-Type: video/mp4" --data-binary @public/videos/<slug>/reel.mp4 "<uploadUrl>"`
   - `complete_media_upload` with the `mediaId`.
3. Write a caption: the hook as the first line, one or two lines of value, the call to action and
   3–5 relevant hashtags. Write a YouTube title of at most 100 characters (the hook works well).
4. `schedule_post` with the channel ids, the media id, the caption, the title and the
   suggested `scheduledAt` (omit it to suggest "right away").
5. Give the user the `reviewUrl`: there they watch the video, can change the caption, channels
   and time (and TikTok's visibility), and press **Approve** to publish or schedule it.

Use `list_posts` to check on progress when the user asks.

## A batch of videos

When the user asks for several videos (for example "a week of explainer videos about my
product"):

1. Ask once for what the videos are about (product, audience, offer), the channels, the
   posting time and the style.
2. Propose one idea per video as a numbered list of hooks and get a single go-ahead.
3. Make each video with steps 2–7, one slug per video (e.g. `week-1-mon`). Show the scripts
   together for one approval instead of stopping for each.
4. Send them with `schedule_post`, suggesting one per day at the chosen time, then list them
   (day, hook, review link) and tell the user they are waiting in Pulsly under
   **Posts → Needs review**.

## Videos ordered in Pulsly

The user orders videos in the Pulsly app: one at a time in **Studio** (they watch it before it
is posted), or every week from the **Content engine** (posted automatically). When they say
"Make my Pulsly videos", or a run starts with `pulsly-helper:` (started by the helper the
moment something is ordered, with nobody watching):

1. `list_video_requests`. If it is empty, say so in one line and stop.
2. For each request, oldest first: `start_video_request`, then make the videos in
   `videosToMake` (a request that was interrupted keeps the ones already delivered) for its
   `business` in its `style` about its `topic`, with steps 2–7 (slugs like
   `<business>-<topic>-1`). Give each video a fresh angle and check `list_posts` with the
   `businessId` so hooks are not repeated.
3. Deliver each video as soon as it is rendered, before starting the next: upload it (step
   8.2) and call `deliver_video` with the request id, the video's `number`, the media id, a
   caption and a YouTube title. Pulsly applies the channels and timing the user chose.
4. `finish_video_request` with `DONE` and a one-line summary, or `FAILED` and what went wrong.

The user already chose everything in Pulsly, so skip the checkpoints in steps 2 and 7 and
never wait for an answer; always do the checks in steps 6 and 7. In a `pulsly-helper:` run, end
with a short summary (business, hooks, where the videos went) for the log. If something fails,
finish the request as `FAILED` instead of retrying endlessly. If Claude's usage limit stops the
run, leave the request as it is: Pulsly hands it out again after a few hours and the helper
picks it up, so only the missing videos are made.

Weekly videos come from the Content engine in Pulsly, so there is nothing to schedule on the
computer except the helper from `SETUP.md`. If the user asks for autopilot here, point them to
**Content engine** in Pulsly.
