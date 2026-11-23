# Pulsly studio

Remotion studio that turns a script into a high-retention 1080×1920 reel. Each video is a
React file in `src/videos/<slug>.tsx`, timed to the words of the voiceover: either drawn shot by
shot with the kit in `src/kit` (see `src/videos/example.tsx`), or a template style from
`src/styles` filled with one typed spec (`example-blocky.tsx`, `example-gameplay.tsx`,
`example-chat.tsx`, `example-quiz.tsx`).

The template styles borrow techniques from open-source projects, rewritten for this studio:
caption pacing from [claude-shorts](https://github.com/AgriciDaniel/claude-shorts) (MIT) and the
camera language (creeping holds, flip-shake kicks, cartoon ink outlines) from
[claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) (MIT). Fonts are from
Google Fonts (SIL Open Font License).

```bash
npm install                       # also generates the music and sound effects
cp .env.example .env              # optional: pick a voice
cp brand.example.json brand.json  # your handle, colour and tone for every video
npm run voice -- <slug>           # public/videos/<slug>/script.txt → voice.wav + words.json
npm run check                     # type-check the video
npm run preview -- <slug>         # a still every second in preview-1.jpg, -2…
npm run preview -- <slug> 3.5     # one moment at half size: still-3.5.jpg
npm run render -- <slug>          # reel.mp4 with music, levelled sound and a motion check
npm run studio                    # preview and tweak in the browser
```

Put product screenshots in `public/brand/` and show them with `<Img src={staticFile('brand/…')} />`.
