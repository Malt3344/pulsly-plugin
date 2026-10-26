// Synthesises the sound effects and the music bed into public/sfx and public/music.
// Everything is generated here, so there is nothing to license. Runs after npm install.
import { mkdir, writeFile } from 'node:fs/promises';

const RATE = 44100;

/** 16-bit PCM WAV from one (mono) or two (stereo) channels of -1..1 samples. */
const wav = (channels) => {
  const length = channels[0].length;
  const count = channels.length;
  const buffer = Buffer.alloc(44 + length * count * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + length * count * 2, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(count, 22);
  buffer.writeUInt32LE(RATE, 24);
  buffer.writeUInt32LE(RATE * count * 2, 28);
  buffer.writeUInt16LE(count * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(length * count * 2, 40);
  for (let i = 0; i < length; i += 1) {
    for (let c = 0; c < count; c += 1) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      buffer.writeInt16LE(Math.round(sample * 32767), 44 + (i * count + c) * 2);
    }
  }
  return buffer;
};

/** Scales samples so the loudest one hits `peak`. */
const normalize = (channels, peak = 0.7) => {
  const max = Math.max(
    ...channels.map((samples) => samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0)),
  );
  return channels.map((samples) => samples.map((s) => (s / max) * peak));
};

const make = (seconds, fn) =>
  Array.from({ length: Math.round(seconds * RATE) }, (_, i) => fn(i / RATE, i));

// Deterministic noise, so every install sounds the same.
let seed = 7;
const noise = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
};

/** One-pole low-pass filter whose cutoff (Hz) may change over time. */
const lowpass = (samples, cutoff) => {
  let y = 0;
  return samples.map((x, i) => {
    const hz = typeof cutoff === 'function' ? cutoff(i / RATE) : cutoff;
    const a = 1 - Math.exp((-2 * Math.PI * hz) / RATE);
    y += a * (x - y);
    return y;
  });
};

const highpass = (samples, hz) => {
  const low = lowpass(samples, hz);
  return samples.map((x, i) => x - low[i]);
};

const effects = {
  // Air rushing past: band-limited noise sweeping up and back down.
  whoosh: () => {
    const raw = make(0.55, () => noise());
    const swept = lowpass(
      highpass(raw, 250),
      (t) => 400 + 3200 * Math.sin(Math.PI * Math.min(1, t / 0.5)),
    );
    return swept.map((s, i) => {
      const t = i / RATE;
      return s * Math.sin(Math.PI * Math.min(1, t / 0.55)) ** 1.5;
    });
  },
  // A bubbly pop for things appearing.
  pop: () =>
    make(0.16, (t) => {
      const freq = 300 + 700 * Math.exp(-t * 40);
      return Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 28);
    }),
  // A crisp mouse click.
  click: () => {
    const burst = highpass(
      make(0.04, () => noise()),
      2000,
    );
    return burst.map((s, i) => {
      const t = i / RATE;
      return (s * 0.7 + Math.sin(2 * Math.PI * 3200 * t) * 0.3) * Math.exp(-t * 160);
    });
  },
  // A short tick for counters and checks.
  tick: () => make(0.05, (t) => Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 90)),
  // A stamp hitting paper: low thump plus a papery slap.
  thud: () => {
    const slap = lowpass(
      make(0.3, () => noise()),
      1800,
    );
    return slap.map((s, i) => {
      const t = i / RATE;
      const body = Math.sin(2 * Math.PI * (55 + 60 * Math.exp(-t * 30)) * t) * Math.exp(-t * 12);
      return body * 0.9 + s * Math.exp(-t * 35) * 0.6;
    });
  },
  // A bright ding for wins and money.
  ding: () =>
    make(1.1, (t) =>
      [1, 2.01, 3.02, 4.17].reduce(
        (sum, partial, index) =>
          sum +
          (Math.sin(2 * Math.PI * 1318 * partial * t) * Math.exp(-t * (3 + index * 2))) /
            (index + 1),
        0,
      ),
    ),
};

const BPM = 92;
const BEAT = 60 / BPM;
// Am7 – Fmaj7 – Cmaj7 – G6, two bars each: warm and unobtrusive.
const CHORDS = [
  [57, 60, 64, 67],
  [53, 57, 60, 64],
  [48, 52, 55, 59],
  [55, 59, 62, 64],
];
const midi = (note) => 440 * 2 ** ((note - 69) / 12);

/** A soft lo-fi bed that loops seamlessly: pads, sub bass, a gentle kick and hats. */
const music = () => {
  const barSeconds = BEAT * 4;
  const seconds = barSeconds * 2 * CHORDS.length;
  const left = new Float64Array(Math.round(seconds * RATE));
  const right = new Float64Array(left.length);

  CHORDS.forEach((chord, chordIndex) => {
    const start = chordIndex * barSeconds * 2;
    const length = barSeconds * 2;
    for (let i = 0; i < length * RATE; i += 1) {
      const t = i / RATE;
      const envelope = Math.min(1, t / 0.6) * Math.min(1, (length - t) / 0.4);
      let l = 0;
      let r = 0;
      chord.forEach((note) => {
        const f = midi(note);
        // Two slightly detuned voices per note, panned apart, for width.
        l += Math.sin(2 * Math.PI * f * 0.998 * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
        r += Math.sin(2 * Math.PI * f * 1.002 * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
      });
      const index = Math.round(start * RATE) + i;
      left[index] += l * envelope * 0.08;
      right[index] += r * envelope * 0.08;
      // Sub bass on the root, pulsing on beats one and three.
      const beatTime = t % (BEAT * 2);
      const bass =
        Math.sin(2 * Math.PI * midi(chord[0] - 24) * t) * Math.exp(-beatTime * 2.2) * 0.35;
      left[index] += bass;
      right[index] += bass;
    }
  });

  const beats = Math.round(seconds / BEAT);
  for (let beat = 0; beat < beats; beat += 1) {
    const at = Math.round(beat * BEAT * RATE);
    // Soft kick on every beat.
    for (let i = 0; i < 0.25 * RATE && at + i < left.length; i += 1) {
      const t = i / RATE;
      const kick =
        Math.sin(2 * Math.PI * (48 + 70 * Math.exp(-t * 35)) * t) * Math.exp(-t * 14) * 0.5;
      left[at + i] += kick;
      right[at + i] += kick;
    }
    // Quiet off-beat hats.
    const hatAt = Math.round((beat + 0.5) * BEAT * RATE);
    const hat = highpass(
      make(0.05, () => noise()),
      7000,
    );
    hat.forEach((s, i) => {
      if (hatAt + i < left.length) {
        const value = s * Math.exp((-i / RATE) * 80) * 0.25;
        left[hatAt + i] += value;
        right[hatAt + i] += value * 0.8;
      }
    });
  }

  // Gentle low-pass to keep the bed warm and out of the voice's way.
  return [lowpass(Array.from(left), 5000), lowpass(Array.from(right), 5000)];
};

await mkdir('public/sfx', { recursive: true });
await mkdir('public/music', { recursive: true });
await Promise.all(
  Object.entries(effects).map(([name, fn]) =>
    writeFile(`public/sfx/${name}.wav`, wav(normalize([fn()], 0.8))),
  ),
);
await writeFile('public/music/bed.wav', wav(normalize(music(), 0.6)));
console.log('Generated sound effects and music');
