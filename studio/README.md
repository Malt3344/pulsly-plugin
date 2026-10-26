# Pulsly studio

Remotion studio that turns a script into a high-retention 1080×1920 reel. Each video is a
React file in `src/videos/<slug>.tsx`, built from the kit in `src/kit` and timed to the
words of the voiceover. See `src/videos/example.tsx`.

```bash
npm install                       # also generates the music and sound effects
cp .env.example .env              # optional: pick a voice
cp brand.example.json brand.json  # your handle, colour and tone for every video
npm run voice -- <slug>           # public/videos/<slug>/script.txt → voice.wav + words.json
npm run check                     # type-check the video
npm run preview -- <slug>         # a still every second in preview-1.jpg, -2…
npm run render -- <slug>          # reel.mp4 with music, levelled sound and a motion check
npm run studio                    # preview and tweak in the browser
```

Put product screenshots in `public/brand/` and show them with `<Img src={staticFile('brand/…')} />`.
