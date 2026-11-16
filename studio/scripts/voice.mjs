// Records public/videos/<slug>/script.txt as the voiceover, with word timings.
// With ELEVENLABS_API_KEY in .env it uses ElevenLabs (voice.mp3); otherwise the free local
// Kokoro voice (voice.wav). Usage: npm run voice -- <slug>
// `npm run voice -- --test` records one sentence to check the ElevenLabs key.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { recordWithElevenLabs } from './voice/elevenlabs.mjs';
import { recordWithKokoro } from './voice/kokoro.mjs';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: use the defaults.
}

const TEST_SLUG = 'voice-test';
const TEST_TEXT = 'This is your Pulsly voice. Every video will sound like this.';

const arg = process.argv[2];
if (!arg) throw new Error('Usage: npm run voice -- <slug>');

const testing = arg === '--test';
const dir = join('public', 'videos', testing ? TEST_SLUG : arg);
if (testing) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'script.txt'), TEST_TEXT);
}
const text = (await readFile(join(dir, 'script.txt'), 'utf8')).trim();
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

// Only one voice file may exist, so the render picks the right one.
await rm(join(dir, 'voice.mp3'), { force: true });
await rm(join(dir, 'voice.wav'), { force: true });

const record = async () => {
  if (apiKey) {
    const { seconds, words } = await recordWithElevenLabs(text, dir, apiKey);
    console.log(`Wrote ${dir}/voice.mp3 with ElevenLabs (${seconds}s) and ${words} words`);
  } else if (testing) {
    throw new Error('No ElevenLabs key yet: add ELEVENLABS_API_KEY to .env (see SETUP.md).');
  } else {
    console.log('No ElevenLabs key in .env: using the free local voice.');
    await recordWithKokoro(text, dir);
  }
};

try {
  await record();
} catch (error) {
  console.error(`\nThe voice could not be recorded: ${error.message}`);
  process.exitCode = 1;
}
