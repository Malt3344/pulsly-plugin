# The Pulsly video kit

Everything is imported from `'../kit'` inside `src/videos/<slug>.tsx`. The canvas is
1080×1920 at 30 fps. Shot content is centred in the area below the headline and drawn 10%
larger than its pixel sizes, so a 940 px wide visual fills the frame.

## Timing: picture on its word

Every component with `on` appears or acts when that word is spoken (cued on the shot's
first word, it comes in with the transition); `delay` adds frames
(30 = one second) after it. A cue is:

- `"word"` — the first time the word is said in the current shot (case and punctuation are
  ignored: `"Facebook"` matches "Facebook.").
- `{ word: 'four', nth: 2 }` — the second time in the shot.
- a number — seconds from the start of the video.

Without `on`, a component is there from the start of its shot.

For custom drawings: `const { since, progress, startFrame } = useCue('word', { delay })` —
`since` is frames since the cue (negative before), `progress` springs 0→1.
`useColors()` gives `{ text, muted, panel, panelRaised, border, faint, accent, tone }`.

## Structure

| Component | Props                                                                                                                                                    | Notes                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Video`   | `props`                                                                                                                                                  | Root. Adds voice, ducked music, progress bar, handle.                                 |
| `Shot`    | `from`, `tone?` (`dark`/`light`/`paper`/`space`), `headline?` `{ text, highlight[] }`, `chapter?`, `transition?` (`push`/`zoom`/`wipe`/`whip`), `scene?` | One shot; cuts in with a whoosh. `scene` is a full-frame backdrop (e.g. `<Stage3D>`). |
| `Stage`   | `width`, `height`                                                                                                                                        | Fixed-size canvas for composing an illustration.                                      |
| `At`      | `x`, `y`                                                                                                                                                 | Absolute position inside a `Stage`.                                                   |
| `Appear`  | `on`, `delay?`, `as?` (`pop`/`rise`/`drop`/`left`/`right`/`zoom`/`fade`), `sound?`, `until?`                                                             | Brings anything in on a word; `until` makes it leave.                                 |
| `Float`   | `amount?`, `speed?`                                                                                                                                      | Gentle bobbing so objects feel alive.                                                 |

## Styles

The style comes from the video's `brand.json` (`"style": "explainer3d" | "paper" | "motion"`)
and sets the default tone of every shot: `space` for 3D, `paper` for paper, `dark` for motion
(alternate with `tone="light"` shots there). Everything below works in every style.

- **paper:** `<Video>` adds the `Presenter` (a cartoon who lip-syncs to the voice, blinks and
  gestures at each new sentence) bottom right; set `"presenter": { "skin", "hair", "shirt" }`
  or `false` in brand.json. Shot content sits higher to leave room for it. Use `chapter`
  labels like `"02 — the real reason"` and put the key word in `highlight` (it turns into an
  accent serif italic).
- **explainer3d:** give each shot `scene={<Stage3D camera={{ from: [x, y, z], to: [x, y, z] }}>…</Stage3D>}`
  and usually `{null}` as children (2D children float on top). The headline becomes captions.
  Objects take `position` `[x, y, z]` (x −2…2 fits the frame, y 0 is table height, the camera
  defaults to `[0, 1.6, 12]` → `[0, 1.2, 10]`), `on`, `delay` and `color`; without `on` they
  are there from the start, with `on` they drop in with a bounce.

| 3D component | Props                                        | Use it for                                   |
| ------------ | -------------------------------------------- | -------------------------------------------- |
| `Stage3D`    | `camera?` `{ from, to, target? }`, `beam?`   | The stage: floor, spotlight, gliding camera. |
| `Pedestal`   | `position?`, `on?`, `color?`                 | Something to stand things on.                |
| `Block`      | `label?` (a number, word or symbol), `size?` | Steps, counts, building blocks.              |
| `Orb`        | `size?`, `color?`                            | An idea, AI, a core; glows in the accent.    |
| `Screen`     | `lines` (`['$15,000', 'savings']`), `tilt?`  | A big number or word on a floating screen.   |
| `Pillar`     | —                                            | A bank, the stock market, an institution.    |
| `Coin`       | —                                            | Money, a price, a saving (spins).            |
| `Burst`      | `on`, `count?`, `color?`                     | An explosion of cubes: lots, chaos, data.    |

Make the 3D shots differ: move the camera in from a different side each time, combine
objects (three `Block`s rising as steps, a `Screen` with the number on a `Pedestal`), and
cue every change to its word.

## Surfaces (product illustrations)

| Component            | Props                                                                                                                                | Notes                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `Window`             | `width?` (940), `url?`, `title?`, `tilt?`                                                                                            | App or browser window. Fill it with `Row`s, `Text`, `Pill`s. |
| `Phone`              | `width?` (470)                                                                                                                       | Phone with notch; for apps, DMs, lock screens.               |
| `Card`               | `glow?`                                                                                                                              | Raised panel.                                                |
| `Row`                | `leading?`, `title`, `subtitle?`, `trailing?`                                                                                        | List/table row. Use 4–8 for a realistic screen.              |
| `Pill`               | `variant?` (`accent`/`solid`/`neutral`/`red`/`green`), `size?`                                                                       | Status, price, label.                                        |
| `Avatar`             | `name`, `size?`, `color?`                                                                                                            | Initials in a circle.                                        |
| `Logo`               | `name` (simple-icons slug: `tiktok`, `instagram`, `youtube`, `facebook`, `stripe`, `notion`, `shopify`, `slack`…), `size?`, `plain?` | Real brand logos.                                            |
| `Text`               | `size?`, `weight?`, `muted?`                                                                                                         | Text inside surfaces.                                        |
| `Img` + `staticFile` | `src={staticFile('brand/app.png')}`                                                                                                  | The user's real screenshots from `public/brand/`.            |

Icons: import any from `lucide-react` (`import { VaultIcon, FolderIcon } from 'lucide-react'`)
and size them big (`size={120}`) to build objects and metaphors.

## Annotations (the beats)

| Component   | Props                                                  | Use it for                                                   |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `Highlight` | `on`, `label?`, `color?`                               | Accent box drawn around something; `label` like "x2".        |
| `Strike`    | `on`, `color?`                                         | Red line through what is wrong or old.                       |
| `Stamp`     | `on`, `color?`, `rotate?`, `size?`, `style` (position) | DONE, STOP, DRAFTED, SOLD — slams down with a thud.          |
| `Cross`     | `on`, `size?`                                          | Red ✕ for failure.                                           |
| `Check`     | `on`, `size?`                                          | Accent tick.                                                 |
| `Cursor`    | `from?`, `to`, `on`, `click?`                          | Glides to `to` and clicks on the word (inside a `Stage`).    |
| `Arrow`     | `from`, `to`, `on`, `curve?`                           | A line drawing itself between two points (inside a `Stage`). |

## Data

| Component   | Props                                                                      | Use it for                           |
| ----------- | -------------------------------------------------------------------------- | ------------------------------------ |
| `Counter`   | `to`, `from?`, `on`, `frames?`, `prefix?`, `suffix?`, `decimals?`, `size?` | A number counting up with ticks.     |
| `Big`       | `children`, `on`, `size?`, `color?`, `outline?`                            | One huge word or number: "5M", "4×". |
| `Bars`      | `values`, `labels?`, `on`                                                  | Growth over time.                    |
| `LineChart` | `values`, `on`, `frames?`                                                  | A trend drawing itself.              |
| `Gauge`     | `value` (0–1), `on`, `label?`                                              | Speed, score, "autopilot".           |
| `Meter`     | `value` (0–1), `on`, `label?`                                              | "AI 92%".                            |
| `Coins`     | `count`, `on`                                                              | Money stacking up, with a ding.      |

## Blocks

| Component       | Props                                                         | Use it for                                    |
| --------------- | ------------------------------------------------------------- | --------------------------------------------- |
| `Notifications` | `items[]` `{ app, text, time?, on?, color? }`                 | Pain or wins piling up.                       |
| `Terminal`      | `header`, `status?`, `lines[]` `{ text, on?, badge?, time? }` | Agents and automation at work.                |
| `Checklist`     | `items[]` `{ text, on? }`                                     | Steps ticking off.                            |
| `Sticker`       | `name`, `on`, `top?`, `subtitle?`                             | "HELLO my name is … services firm": reframes. |
| `Quote`         | `text`, `author`, `role?`, `on`                               | A customer saying it.                         |
| `Comment`       | `keyword`, `reward`, `on`, `comments?`                        | The closing ask, with comments pouring in.    |

## Sound

Real CC0 recordings (Kenney, artisticdude; see `public/sfx/CREDITS.md`), several takes each
so repeats sound natural. Shots whoosh in; `Appear` pops; stamps hit; strikes scribble;
crosses buzz; cursors click; checks and counters tick; `Big` rises; coins and rewards ding.
Add more with `<Sfx name="whoosh|pop|click|tick|stamp|ding|error|scribble|rise" at={frame} />`
(frame within the shot). Music plays under everything and dips while the voice speaks; drop
your own track at `public/music/bed.wav` to replace it.

## Patterns that work

- **Product walkthrough:** a `Window` with 5 `Row`s; `Highlight` the key row on its word; a
  `Cursor` clicks the button; `Check`s pop on each row; a `Stamp` says DONE.
- **Pain:** `Notifications` piling up on a `Phone`, then a red `Stamp` with the cost.
- **Before/after:** two `Card`s; `Strike` through the old way, `Check`s on the new.
- **Proof:** `Bars` grow while a `Counter` climbs to the result; a green `Stamp` with the
  multiple.
- **Metaphor:** a big lucide icon (vault, compass, rocket) in a `Card` with a `Pill` label,
  then an annotation that twists it.
- **Ending:** `Comment` with the keyword and reward.
