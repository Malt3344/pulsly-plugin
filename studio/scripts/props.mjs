// Prepares a video for rendering: points src/current.ts at src/videos/<slug>.tsx and
// writes the props (brand kit, voiceover, word timings) to public/videos/<slug>/.props.json.
// The brand kit is public/videos/<slug>/brand.json (the video's business), else brand.json.
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

export const prepare = async (slug) => {
  if (!slug) throw new Error('Pass the video slug, e.g. npm run render -- my-video');
  if (!existsSync(join('src', 'videos', `${slug}.tsx`))) {
    throw new Error(`Write the video first: src/videos/${slug}.tsx`);
  }

  await writeFile(
    join('src', 'current.ts'),
    `// The video the scripts render. \`npm run preview/render -- <slug>\` rewrites this line.\nexport { default } from './videos/${slug}';\n`,
  );

  const dir = join('public', 'videos', slug);
  const brandPath = [join(dir, 'brand.json'), 'brand.json'].find((path) => existsSync(path));
  const brandKit = brandPath ? await readJson(brandPath) : {};
  const props = {
    slug,
    brand: {
      accent: brandKit.accent ?? '#3fe0b0',
      tone: brandKit.tone ?? brandKit.style ?? 'dark',
      handle: brandKit.handle,
    },
    music: brandKit.music ?? true,
    audio: existsSync(join(dir, 'voice.wav')) ? `videos/${slug}/voice.wav` : undefined,
    words: existsSync(join(dir, 'words.json')) ? await readJson(join(dir, 'words.json')) : [],
  };
  const path = join(dir, '.props.json');
  await writeFile(path, JSON.stringify(props));

  return { dir, path, props };
};
