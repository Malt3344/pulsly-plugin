// Renders src/videos/<slug>.tsx to public/videos/<slug>/reel.mp4, levels the sound to
// -14 LUFS like the platforms expect, and reports stretches where nothing new happens.
// Usage: npm run render -- <slug>
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { findStillStretches } from './motion.mjs';
import { prepare } from './props.mjs';

/** A still frame longer than this loses viewers. */
const MAX_STILL_SECONDS = 1.2;

const { dir, path } = await prepare(process.argv[2]);
const raw = join(dir, 'reel-raw.mp4');
const output = join(dir, 'reel.mp4');

execFileSync(
  'npx',
  ['remotion', 'render', 'src/index.ts', 'Reel', raw, `--props=${path}`, '--gl=angle'],
  {
    stdio: 'inherit',
  },
);

execFileSync(
  'npx',
  [
    'remotion',
    'ffmpeg',
    '-y',
    '-loglevel',
    'error',
    '-i',
    raw,
    '-c:v',
    'copy',
    '-af',
    'loudnorm=I=-14:TP=-1.5:LRA=11',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    output,
  ],
  { stdio: 'inherit' },
);
rmSync(raw);

const { stretches } = findStillStretches(output, MAX_STILL_SECONDS);

console.log(`Rendered ${output}`);
if (stretches.length === 0) {
  console.log(`Motion check: something new happens at least every ${MAX_STILL_SECONDS}s.`);
} else {
  console.log(
    `Motion check: ${stretches.length} still stretch(es) longer than ${MAX_STILL_SECONDS}s — add a beat there:`,
  );
  stretches.forEach(([from, to]) => console.log(`  ${from.toFixed(2)}s → ${to.toFixed(2)}s`));
}
