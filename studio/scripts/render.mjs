// Renders public/videos/<slug>/video.json to reel.mp4, adding the voiceover when present.
// Usage: npm run render -- <slug>
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const slug = process.argv[2];
if (!slug) throw new Error('Usage: npm run render -- <slug>');

const dir = join('public', 'videos', slug);
const video = JSON.parse(await readFile(join(dir, 'video.json'), 'utf8'));

if (existsSync(join(dir, 'voice.wav'))) video.audio ??= `videos/${slug}/voice.wav`;
if (existsSync(join(dir, 'words.json'))) {
  video.words ??= JSON.parse(await readFile(join(dir, 'words.json'), 'utf8'));
}

const props = join(dir, '.props.json');
await writeFile(props, JSON.stringify(video));

const output = join(dir, 'reel.mp4');
execFileSync('npx', ['remotion', 'render', 'src/index.ts', 'Reel', output, `--props=${props}`], {
  stdio: 'inherit',
});
console.log(`Rendered ${output}`);
