# Pulsly studio

Remotion template that renders a 1080×1920 reel from `public/videos/<slug>/video.json`.

```bash
npm install
cp .env.example .env               # optional: pick a voice
cp brand.example.json brand.json   # your handle, colour and style for every video
npm run voice -- <slug>            # script.txt → voice.wav + words.json (free, local)
npm run preview -- <slug>          # one still per scene in preview.jpg, to check the video
npm run render -- <slug>           # video.json → reel.mp4
npm run studio                     # preview and tweak in the browser
```

The format of `video.json` is defined in `src/schema.ts`. Put product screenshots in
`public/brand/` and show them with the `image` visual.
