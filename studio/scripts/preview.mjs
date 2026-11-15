// Renders contact sheets with a still every second: public/videos/<slug>/preview-1.jpg, -2…
// Look at them to check the video before the full render. Usage: npm run preview -- <slug>
// Each still is a real frame of the video (3D scenes included), then they are laid out
// in a grid by the Contact composition.
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';
import { prepare } from './props.mjs';

const INTERVAL = 1;
const PER_PAGE = 18;
const TILE_SCALE = 0.2;
const chromiumOptions = { gl: 'angle' };

const { dir, path, props } = await prepare(process.argv[2]);
const inputProps = { ...JSON.parse(await readFile(path, 'utf8')), audio: undefined, music: false };
const serveUrl = await bundle({ entryPoint: resolve('src/index.ts') });
const browser = await openBrowser('chrome', { chromiumOptions });
const common = { serveUrl, puppeteerInstance: browser, chromiumOptions, imageFormat: 'jpeg' };

const reel = await selectComposition({ ...common, id: 'Reel', inputProps });
const last = props.words[props.words.length - 1];
const duration = Math.min((last ? last.end : 10) + 0.5, reel.durationInFrames / reel.fps);
const times = Array.from({ length: Math.floor(duration / INTERVAL) + 1 }, (_, i) => i * INTERVAL);

const tiles = [];
for (const seconds of times) {
  const frame = Math.min(reel.durationInFrames - 1, Math.round(seconds * reel.fps));
  const { buffer } = await renderStill({
    ...common,
    composition: reel,
    inputProps,
    frame,
    scale: TILE_SCALE,
    jpegQuality: 70,
  });
  tiles.push({ src: `data:image/jpeg;base64,${buffer.toString('base64')}`, seconds });
}

for (let page = 0; page * PER_PAGE < tiles.length; page += 1) {
  const pageProps = { tiles: tiles.slice(page * PER_PAGE, (page + 1) * PER_PAGE) };
  const contact = await selectComposition({ ...common, id: 'Contact', inputProps: pageProps });
  const output = join(dir, `preview-${page + 1}.jpg`);
  await renderStill({ ...common, composition: contact, inputProps: pageProps, output });
  console.log(`Preview: ${output}`);
}

await browser.close({ silent: true });
