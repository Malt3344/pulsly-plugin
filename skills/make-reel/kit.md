# The Pulsly video kit

Everything is imported from `'../kit'` inside `src/videos/<slug>.tsx`. The canvas is
1080×1920 at 30 fps. Shot content is centred in the area below the headline and drawn 10%
larger than its pixel sizes, so a 940 px wide visual fills the frame.

## Timing: picture on its word

Every component with `on` appears or acts when that word is spoken; `delay` adds frames
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

| Component | Props                                                                                                                                    | Notes                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `Video`   | `props`                                                                                                                                  | Root. Adds voice, ducked music, progress bar, handle. |
| `Shot`    | `from`, `tone?` (`dark`/`light`), `headline?` `{ text, highlight[] }`, `chapter?`, `entrance?` (`rise`/`zoom`/`slide`/`drop`), `whoosh?` | One shot; plays a whoosh on entry. Vary `entrance`.   |
| `Stage`   | `width`, `height`                                                                                                                        | Fixed-size canvas for composing an illustration.      |
| `At`      | `x`, `y`                                                                                                                                 | Absolute position inside a `Stage`.                   |
| `Appear`  | `on`, `delay?`, `as?` (`pop`/`rise`/`drop`/`left`/`right`/`zoom`/`fade`), `sound?`, `until?`                                             | Brings anything in on a word; `until` makes it leave. |
| `Float`   | `amount?`, `speed?`                                                                                                                      | Gentle bobbing so objects feel alive.                 |

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

Shots whoosh in; `Appear` pops; stamps thud; cursors click; checks and counters tick; coins
ding. Add more with `<Sfx name="pop|whoosh|click|tick|thud|ding" at={frame} />` (frame within
the shot). Music plays under everything and dips while the voice speaks.

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
