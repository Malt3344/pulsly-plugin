// The Pulsly helper. Runs in the background on the user's computer and starts Claude the
// moment a video is ordered in Pulsly. Checking costs nothing: Claude only starts when there
// is something to make. Set up by Claude (see SETUP.md); run with `node helper.mjs`.
import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FOLDER = dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = join(FOLDER, '.pulsly-helper');
/** Optional: a token from `claude setup-token`, for computers where Claude is not logged in. */
const CLAUDE_TOKEN_FILE = join(FOLDER, '.pulsly-claude-token');
const LOG_FILE = join(FOLDER, 'pulsly-helper.log');
const API_URL = process.env.PULSLY_API_URL ?? 'https://api.pulsly.co';

const CHECK_EVERY_MS = 20_000;
/** After a failed run (e.g. Claude's usage limit), wait before trying again. */
const BACK_OFF_MS = 20 * 60_000;
const PROMPT = 'pulsly-helper: make the videos ordered in Pulsly';
const TOOLS = ['Bash', 'Read', 'Write', 'Edit', 'mcp__pulsly'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const log = (message) =>
  appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`, 'utf8');

const readFile = (path) => (existsSync(path) ? readFileSync(path, 'utf8').trim() : undefined);

/** How many videos are waiting, or undefined when Pulsly cannot be reached. */
const pendingVideos = async (token) => {
  try {
    const response = await fetch(`${API_URL}/helper/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) {
      log('The helper token is not valid any more. Say "Set up Pulsly for me" in Claude.');
      return undefined;
    }

    return response.ok ? (await response.json()).pending : undefined;
  } catch {
    return undefined; // Offline: try again later.
  }
};

/** Runs Claude in this folder until it has made the waiting videos. Resolves its exit code. */
const runClaude = () =>
  new Promise((resolve) => {
    log('Videos are waiting: starting Claude.');
    const claudeToken = readFile(CLAUDE_TOKEN_FILE);
    const claude = spawn('claude', ['-p', PROMPT, '--allowedTools', ...TOOLS], {
      cwd: FOLDER,
      shell: process.platform === 'win32',
      env: claudeToken ? { ...process.env, CLAUDE_CODE_OAUTH_TOKEN: claudeToken } : process.env,
    });
    // Keep a Mac awake while Claude works, so the video is not cut off by sleep.
    const awake =
      process.platform === 'darwin'
        ? spawn('caffeinate', ['-i', '-w', String(claude.pid)], { stdio: 'ignore' })
        : undefined;
    const write = (chunk) => appendFileSync(LOG_FILE, chunk);

    claude.stdout.on('data', write);
    claude.stderr.on('data', write);
    claude.on('error', (error) => {
      log(`Could not start Claude: ${error.message}`);
      resolve(1);
    });
    claude.on('close', (code) => {
      awake?.kill();
      log(`Claude finished (exit ${code}).`);
      resolve(code ?? 1);
    });
  });

log('Pulsly helper started.');

for (;;) {
  const token = readFile(TOKEN_FILE);
  const pending = token ? await pendingVideos(token) : undefined;

  if (pending > 0) {
    const code = await runClaude();
    // Back off when Claude failed (e.g. its usage limit) or left the videos unmade, instead of
    // starting it again and again.
    const stillPending = await pendingVideos(token);
    const madeProgress = code === 0 && !(stillPending >= pending);
    await sleep(madeProgress ? CHECK_EVERY_MS : BACK_OFF_MS);
  } else {
    await sleep(CHECK_EVERY_MS);
  }
}
