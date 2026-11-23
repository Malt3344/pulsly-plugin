# Template styles

`blocky`, `gameplay`, `chat` and `quiz` are templates. You don't draw the shots; you fill one typed
spec, and the template does the animation, camera, timing, captions and sound. Write
`<studio>/src/videos/<slug>.tsx` as a copy of the style's finished example and change only the
spec:

| Style      | Example                           | Component                                   |
| ---------- | --------------------------------- | ------------------------------------------- |
| `blocky`   | `src/videos/example-blocky.tsx`   | `BlockyStory` from `'../styles/blocky'`     |
| `gameplay` | `src/videos/example-gameplay.tsx` | `GameplayStory` from `'../styles/gameplay'` |
| `chat`     | `src/videos/example-chat.tsx`     | `ChatStory` from `'../styles/chat'`         |
| `quiz`     | `src/videos/example-quiz.tsx`     | `QuizStory` from `'../styles/quiz'`         |

`npm run check` fails on any value the template does not know, so a video that type-checks looks
the way the style looks. Only use values from the lists below.

**Cues** work as in `kit.md`: `"word"` is the first time that word is said after the scene (or
round) starts, `{ word, nth }` the nth time, a number is seconds from the start. Punctuation and
case are ignored, so `"idea."` and `"idea"` are the same cue. Pick words the voice really says
(check `words.json`).

## `blocky`: a story with blocky 3D characters

A story acted out by blocky toy characters in bright 3D game worlds, with chunky game captions.
Best for stories, "what happened when…", lessons with a twist and funny everyday situations.

```tsx
<BlockyStory props={props} story={{ cast: { … }, scenes: [ … ] }} />
```

**`cast`**: everyone in the story, by id: `{ name?, skin?, shirt, pants, hair?, hairColor? }`.

- `skin`: `yellow` (default), `light`, `tan`, `brown`, `dark` or a hex colour.
- `hair`: `none`, `short`, `long`, `spiky`, `cap`, `crown`, `beanie`.
- Give every character clearly different shirt colours, so viewers tell them apart at a glance.

**`scenes`**: one per beat (2–5 s). Each scene:

| Field     | Values                                                                                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`    | The cue it starts on. The first scene starts at 0.                                                                                                                            |
| `place`   | `park`, `city`, `school`, `house` (indoors), `obby` (floating platforms over lava), `beach`, `space`, `shop` (indoors)                                                        |
| `time`    | `day` (default), `sunset`, `night` (lamps and windows light up)                                                                                                               |
| `camera`  | `wide` (whole scene), `close` (a face), `low` (heroic, from below), `high` (from above), `orbit` (circles), `side` (glides), `over` (over one shoulder at `focus`)            |
| `focus`   | The character `close`, `low` and `over` are about (default: the first actor).                                                                                                 |
| `actors`  | `{ id, at, action?, face?, on? }`. `at`: `left`, `center`, `right`, `back-left`, `back-right`. Before `on` they stand idle and smile; from `on` they do `action` with `face`. |
| `props`   | `{ kind, at, on?, text? }`. `kind`: `coin`, `trophy`, `gift`, `phone`, `sign` (with `text`, max ~12 letters), `car`, `crate`, `cash`. Next to the actor on the same spot.     |
| `effects` | `{ kind, on, over }` over a character id or a spot: `boom` (POW!), `sparkles`, `question`, `exclamation`, `hearts`, `money`, `zzz`, `sweat`.                                  |
| `bubbles` | `{ by, text, on }`: a speech bubble with the character's name. Short lines (max ~8 words); the voice should say them.                                                         |
| `shake`   | Cues where the camera kicks: the punch words.                                                                                                                                 |
| `flash`   | `true` for a white flash as the scene cuts in: use it once, right after the hook.                                                                                             |

Actions: `idle`, `talk`, `wave`, `point`, `walk` (crosses the spot), `run` (runs across),
`enter` (walks in from the side), `exit` (walks off), `jump`, `dance`, `sit`, `fall`, `celebrate`,
`cry`, `think`, `shrug`, `scared`. Faces: `happy`, `neutral`, `sad`, `angry`, `shocked`, `smirk`,
`cool` (sunglasses), `cry`, `love` (heart eyes), `sleepy`.

Rules that make it work:

- **Show the sentence literally.** "Nobody came" → the character alone, `cry`, `sweat`. "The whole
  city lined up" → `city`, `high` camera, runners in the back, the hero `scared`.
- **One or two actors per scene**, three at most. Never two actors on the same spot.
- **Change the camera every scene** and the place when the story moves. `close` on emotional
  words, `wide` to set a place, `orbit` or `low` for the win.
- **A beat every second:** an `on` action change, an effect, a prop popping in or a bubble. Put the
  biggest one (`boom` + `shake`) on the punchline.
- The first scene is the thumbnail: a strong pose and an effect early (`question`, `exclamation`).

## `gameplay`: a story told over a parkour run

The voice tells a story; a blocky runner races through a 3D obstacle course underneath, with big
bold captions and the title on a post-style card for the first 3.5 seconds. Best for confessions,
"storytime", drama and customer stories. All the work is in the script.

```tsx
<GameplayStory props={props} story={{ title, author?, course?, runner? }} />
```

- `title`: the hook as a post title, under 90 characters, first person ("I quit my job to sell
  candles and my family laughed at me").
- `author`: a first name or the handle (default: the brand handle).
- `course`: `lava` (default), `sky`, `neon`.
- `runner`: a cast look, as in `blocky`.
- Script: 35–60 s, first person, past tense, one twist and a pay-off line at the end. The
  captions show every word, so write for reading too.

## `chat`: a text conversation

A messenger thread that plays out with the voice: typing dots before every reply, a sound on every
message, the thread scrolling up. Best for funny or dramatic exchanges, objections and
customer messages.

```tsx
<ChatStory props={props} chat={{ contact: { name, status? }, messages: [ … ], theme? }} />
```

- `messages`: `{ from: 'me' | 'them', text, reaction?, on? }`. `me` is the brand (blue, on the
  right), `them` the other person. `reaction` is one emoji stuck to the bubble.
- **The script is the messages, in order**, read out word for word (it may add nothing in
  between). Each message then appears on its own first word; set `on` only when a message's first
  word comes earlier in the script.
- 6–10 messages, 2–12 words each. Start with the most surprising line, end with the call to action.
- `theme`: `dark` (default) or `light`.

## `quiz`: trivia or "would you rather"

```tsx
<QuizStory props={props} quiz={{ kind: 'trivia', title, rounds: [ … ] }} />
<QuizStory props={props} quiz={{ kind: 'would-you-rather', title, rounds: [ … ] }} />
```

- `trivia` rounds: `{ question, options (2–4), answer (index), on?, reveal? }`. A countdown ring
  runs from the question to the reveal, then the right answer turns green on the word that
  reveals it. Script per round: the question, the options ("Mercury, Venus or Mars?"), then the
  answer ("It's Venus."). Set `reveal` to the first word of the answer sentence (`"It's"`), or
  `{ word, nth: 2 }` when the answer word is also one of the options read before.
- `would-you-rather` rounds: `{ a, b, aPercent, on?, reveal? }`: top half red, bottom half blue,
  percentages count up on `reveal` (default: just before the next round). Script per round:
  "Would you rather <a>, or <b>?" then a short reaction.
- `title`: the hook on screen all the way through ("Only 1% get 3/3").
- 3–5 rounds; the hook first ("Only one percent get all three right."), and a call to action
  after the last reveal ("Comment your score.").
