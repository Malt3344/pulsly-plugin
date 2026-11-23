// The Pulsly helper. Runs in the background on the user's computer and:
// - starts Claude the moment a video is ordered in Pulsly (checking costs nothing: Claude
//   only starts when there is something to make);
// - downloads video links that Pulsly's server may not fetch (YouTube blocks servers) over
//   this computer's own connection, and uploads them so Pulsly can make the clips.
// Set up by Claude (see SETUP.md); run with `node helper.mjs`.
import { spawn } from 'node:child_process';
import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  openAsBlob,
  readFileSync,
} from 'node:fs';
import { rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FOLDER = dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = join(FOLDER, '.pulsly-helper');
/** Optional: a token from `claude setup-token`, for computers where Claude is not logged in. */
const CLAUDE_TOKEN_FILE = join(FOLDER, '.pulsly-claude-token');
const LOG_FILE = join(FOLDER, 'pulsly-helper.log');
const BIN_DIR = join(FOLDER, 'bin');
const DOWNLOADS_DIR = join(FOLDER, 'downloads');
const API_URL = process.env.PULSLY_API_URL ?? 'https://api.pulsly.co';

const CHECK_EVERY_MS = 20_000;
/** After a failed run (e.g. Claude's usage limit), wait before trying again. */
const BACK_OFF_MS = 20 * 60_000;
const PROMPT = 'pulsly-helper: make the videos ordered in Pulsly';
const TOOLS = ['Bash', 'Read', 'Write', 'Edit', 'mcp__pulsly'];

/** yt-dlp as a single ready-made program, so nothing else has to be installed. */
const YT_DLP_VERSION = '2026.10.26';
const YT_DLP_ASSET = {
  darwin: 'yt-dlp_macos',
  win32: 'yt-dlp.exe',
  linux: process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux',
}[process.platform];
const YT_DLP = join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
const YT_DLP_VERSION_FILE = join(BIN_DIR, 'yt-dlp.version');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const log = (message) =>
  appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`, 'utf8');

const readFile = (path) => (existsSync(path) ? readFileSync(path, 'utf8').trim() : undefined);

const api = (token, path, body) =>
  fetch(`${API_URL}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

/** Videos waiting to be made and links waiting to be downloaded, or undefined when offline. */
const checkPulsly = async (token) => {
  try {
    const response = await api(token, '/helper/pending');
    if (response.status === 401) {
      log('The helper token is not valid any more. Say "Set up Pulsly for me" in Claude.');
      return undefined;
    }

    return response.ok ? await response.json() : undefined;
  } catch {
    return undefined; // Offline: try again later.
  }
};

/** Runs a program and resolves its output, or rejects with the end of its error output. */
const runProgram = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: FOLDER });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0
        ? resolve(stdout)
        : reject(new Error(stderr.trim().split('\n').slice(-3).join(' ') || `exit ${code}`)),
    );
  });

/** Downloads the pinned yt-dlp the first time it is needed. */
const ensureYtDlp = async () => {
  if (existsSync(YT_DLP) && readFile(YT_DLP_VERSION_FILE) === YT_DLP_VERSION) {
    return;
  }
  if (!YT_DLP_ASSET) {
    throw new Error(`Downloading links is not supported on ${process.platform}`);
  }

  log(`Installing yt-dlp ${YT_DLP_VERSION}.`);
  mkdirSync(BIN_DIR, { recursive: true });
  const response = await fetch(
    `https://github.com/yt-dlp/yt-dlp/releases/download/${YT_DLP_VERSION}/${YT_DLP_ASSET}`,
  );
  if (!response.ok) {
    throw new Error(`Could not download yt-dlp (${response.status})`);
  }
  await writeFile(YT_DLP, Buffer.from(await response.arrayBuffer()));
  chmodSync(YT_DLP, 0o755);
  await writeFile(YT_DLP_VERSION_FILE, YT_DLP_VERSION);
};

/** Downloads one link over this computer's connection and hands it to Pulsly. */
const downloadForPulsly = async (token, { id, url }) => {
  log(`Downloading ${url} for Pulsly.`);
  const path = join(DOWNLOADS_DIR, `${id}.mp4`);

  try {
    await ensureYtDlp();
    mkdirSync(DOWNLOADS_DIR, { recursive: true });
    const title = await runProgram(YT_DLP, [
      '--no-playlist',
      '--no-progress',
      '--no-simulate',
      '--print',
      'title',
      '--js-runtimes',
      `node:${process.execPath}`,
      '-f',
      'bv*[vcodec^=avc1][height<=1080]+ba[ext=m4a]/bv*[height<=1080][ext=mp4]+ba[ext=m4a]/bv*[height<=1080]+ba/b',
      '--merge-output-format',
      'mp4',
      '-o',
      path,
      url,
    ]);

    const { size } = await stat(path);
    const upload = await api(token, `/helper/downloads/${id}/upload`, { size });
    if (!upload.ok) {
      throw new Error(`Pulsly did not accept the upload (${upload.status})`);
    }
    const { uploadUrl } = await upload.json();
    // A file Blob streams from disk and tells the server its size.
    const put = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: await openAsBlob(path, { type: 'video/mp4' }),
    });
    if (!put.ok) {
      throw new Error(`Uploading failed (${put.status})`);
    }
    await api(token, `/helper/downloads/${id}/done`, { title: title.trim().split('\n')[0] });
    log('Downloaded and sent to Pulsly.');
  } catch (error) {
    const reason = error.cause
      ? `${error.message} (${error.cause.message ?? error.cause})`
      : error.message;
    log(`Could not download ${url}: ${reason}`);
    await api(token, `/helper/downloads/${id}/failed`, { reason }).catch(() => {});
  } finally {
    await rm(path, { force: true });
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
  const work = token ? await checkPulsly(token) : undefined;

  for (const download of work?.downloads ?? []) {
    await downloadForPulsly(token, download);
  }

  if (work?.pending > 0) {
    const code = await runClaude();
    // Back off when Claude failed (e.g. its usage limit) or left the videos unmade, instead of
    // starting it again and again.
    const after = await checkPulsly(token);
    const madeProgress = code === 0 && !(after?.pending >= work.pending);
    await sleep(madeProgress ? CHECK_EVERY_MS : BACK_OFF_MS);
  } else {
    await sleep(CHECK_EVERY_MS);
  }
}
