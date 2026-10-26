// Renders one still per scene into public/videos/<slug>/preview.jpg to check the video
// before the full render. Usage: npm run preview -- <slug>
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { writeProps } from './props.mjs';

const { dir, props } = await writeProps(process.argv[2]);
const output = join(dir, 'preview.jpg');

execFileSync(
  'npx',
  ['remotion', 'still', 'src/index.ts', 'Contact', output, `--props=${props}`, '--log=error'],
  { stdio: 'inherit' },
);
console.log(`Preview: ${output}`);
