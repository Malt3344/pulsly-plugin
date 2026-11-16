// The studio-quality voice: ElevenLabs, with the user's own API key from .env.
// Writes voice.mp3 and words.json (every word with its start and end) into `dir`.
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** "Brian": a warm, clear narrator. Any voice id from the user's ElevenLabs library works. */
const DEFAULT_VOICE_ID = 'nPczCjzI2devNBz1zQrb';
const MODEL = 'eleven_multilingual_v2';

const round = (seconds) => Math.round(seconds * 1000) / 1000;

/** Groups ElevenLabs' character timings into words. */
const toWords = ({
  characters,
  character_start_times_seconds: starts,
  character_end_times_seconds: ends,
}) => {
  const words = [];
  let current;

  characters.forEach((character, index) => {
    if (/\s/.test(character)) {
      current = undefined;
    } else if (current) {
      current.text += character;
      current.end = round(ends[index]);
    } else {
      current = { text: character, start: round(starts[index]), end: round(ends[index]) };
      words.push(current);
    }
  });

  return words;
};

/** What went wrong, in words the user can act on. */
const explain = (status, body) => {
  if (status === 401) {
    return 'ElevenLabs did not accept the API key. Make a new key with "Text to Speech" access and paste it again.';
  }
  if (status === 402 || /quota|credits/i.test(body)) {
    return 'The ElevenLabs account is out of credits for this month. Upgrade the plan or wait for the next month.';
  }

  return `ElevenLabs answered ${status}: ${body.slice(0, 300)}`;
};

export const recordWithElevenLabs = async (text, dir, apiKey) => {
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35, speed: 1.05 },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(explain(response.status, await response.text()));
  }

  const { audio_base64: audio, alignment } = await response.json();
  const words = toWords(alignment);

  await writeFile(join(dir, 'voice.mp3'), Buffer.from(audio, 'base64'));
  await writeFile(join(dir, 'words.json'), `${JSON.stringify(words, null, 2)}\n`);

  return { seconds: words.at(-1)?.end ?? 0, words: words.length };
};
