// Renders contact sheets with a still every second: public/videos/<slug>/preview-1.jpg, -2…
// Look at them to check the video before the full render. Usage: npm run preview -- <slug>
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { prepare } from './props.mjs';

const INTERVAL = 1;
const PER_PAGE = 18;

const { dir, path, props } = await prepare(process.argv[2]);
const last = props.words[props.words.length - 1];
const pages = Math.ceil(((last ? last.end : 10) + 1) / INTERVAL / PER_PAGE);

for (let page = 1; page <= pages; page += 1) {
  const pageProps = join(dir, '.props-page.json');
  await writeFile(
    pageProps,
    JSON.stringify({ ...JSON.parse(await readFile(path, 'utf8')), interval: INTERVAL, page }),
  );
  const output = join(dir, `preview-${page}.jpg`);
  execFileSync(
    'npx',
    ['remotion', 'still', 'src/index.ts', 'Contact', output, `--props=${pageProps}`, '--log=error'],
    {
      stdio: 'inherit',
    },
  );
  console.log(`Preview: ${output}`);
}
