// Renders public/videos/<slug>/video.json to reel.mp4, with the brand kit and voiceover.
// Usage: npm run render -- <slug>
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { writeProps } from './props.mjs';

const { dir, props } = await writeProps(process.argv[2]);
const output = join(dir, 'reel.mp4');

execFileSync('npx', ['remotion', 'render', 'src/index.ts', 'Reel', output, `--props=${props}`], {
  stdio: 'inherit',
});
console.log(`Rendered ${output}`);
