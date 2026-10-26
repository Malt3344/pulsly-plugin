// Builds the props for a video: brand.json defaults, then video.json, then the voiceover.
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

/** Writes public/videos/<slug>/.props.json and returns its path. */
export const writeProps = async (slug) => {
  if (!slug) throw new Error('Pass the video slug, e.g. npm run render -- my-video');

  const dir = join('public', 'videos', slug);
  // The brand kit (style, accent, handle) applies to every video unless video.json overrides it.
  const brand = existsSync('brand.json') ? await readJson('brand.json') : {};
  const { style, accent, handle } = brand;
  const video = { style, accent, handle, ...(await readJson(join(dir, 'video.json'))) };

  if (existsSync(join(dir, 'voice.wav'))) video.audio ??= `videos/${slug}/voice.wav`;
  if (existsSync(join(dir, 'words.json'))) video.words ??= await readJson(join(dir, 'words.json'));

  const props = join(dir, '.props.json');
  await writeFile(props, JSON.stringify(video));

  return { dir, props };
};
