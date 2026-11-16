// The free fallback voice: Kokoro, an open-source voice that runs on this computer.
// Writes voice.wav and words.json into `dir`.
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Index of the first and last sample that is louder than silence. */
const speechBounds = (samples) => {
  const threshold = 0.02;
  let first = samples.findIndex((sample) => Math.abs(sample) > threshold);
  let last = samples.length - 1;
  while (last > first && Math.abs(samples[last]) <= threshold) last -= 1;
  if (first < 0) first = 0;

  return [first, last];
};

/** Spreads a sentence's words over its speech, weighted by length. */
const timeWords = (sentence, start, end) => {
  const words = sentence.split(/\s+/).filter(Boolean);
  const weights = words.map((word) => word.replace(/[^\p{L}\p{N}]/gu, '').length + 2);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = start;

  return words.map((word, index) => {
    const duration = ((end - start) * weights[index]) / total;
    const timed = { text: word, start: round(cursor), end: round(cursor + duration) };
    cursor += duration;

    return timed;
  });
};

const round = (seconds) => Math.round(seconds * 1000) / 1000;

/** Pause kept between sentences. Kokoro leaves over a second; fast reels leave almost none. */
const GAP_SECONDS = 0.2;
/** Lead-in before the first word, so the hook starts at once. */
const LEAD_SECONDS = 0.05;

/** 16-bit mono PCM WAV. */
const toWav = (samples, sampleRate) => {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, index) => {
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + index * 2);
  });

  return buffer;
};

export const recordWithKokoro = async (text, dir) => {
  // Loaded only when needed: it is large and takes over the process's error handling.
  const { KokoroTTS, TextSplitterStream } = await import('kokoro-js');
  const voice = process.env.VOICE || 'am_michael';
  const speed = Number(process.env.VOICE_SPEED || 1.08);

  console.log(`Loading the voice model (downloads ~90 MB the first time)…`);
  const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
    dtype: 'q8',
    device: 'cpu',
  });

  const chunks = [];
  const words = [];
  let sampleRate = 24000;
  let offset = 0;

  // Kokoro speaks one sentence at a time, which gives exact sentence timings.
  const sentences = new TextSplitterStream();
  sentences.push(text);
  sentences.close();

  for await (const { text: sentence, audio } of tts.stream(sentences, { voice, speed })) {
    sampleRate = audio.sampling_rate;
    const [first, last] = speechBounds(audio.audio);
    // Keep only the speech, then add a short, even pause.
    const pad = Math.round((chunks.length === 0 ? LEAD_SECONDS : GAP_SECONDS) * sampleRate);
    const speech = audio.audio.slice(first, last + 1);
    const chunk = new Float32Array(pad + speech.length);
    chunk.set(speech, pad);
    words.push(
      ...timeWords(
        sentence,
        (offset + pad) / sampleRate,
        (offset + pad + speech.length) / sampleRate,
      ),
    );
    chunks.push(chunk);
    offset += chunk.length;
  }

  const samples = new Float32Array(offset);
  chunks.reduce((position, chunk) => {
    samples.set(chunk, position);
    return position + chunk.length;
  }, 0);

  await writeFile(join(dir, 'voice.wav'), toWav(samples, sampleRate));
  await writeFile(join(dir, 'words.json'), `${JSON.stringify(words, null, 2)}\n`);

  console.log(
    `Wrote ${dir}/voice.wav (${round(offset / sampleRate)}s, voice ${voice}) and ${words.length} words`,
  );
};
