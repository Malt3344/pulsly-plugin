import { Audio, Sequence, staticFile } from 'remotion';

/** Real CC0 recordings in public/sfx (see CREDITS.md), with a few takes of each. */
const LIBRARY = {
  whoosh: { takes: 3, volume: 0.45 },
  pop: { takes: 4, volume: 0.32 },
  click: { takes: 2, volume: 0.5 },
  tick: { takes: 2, volume: 0.3 },
  stamp: { takes: 2, volume: 0.55 },
  ding: { takes: 2, volume: 0.35 },
  error: { takes: 1, volume: 0.35 },
  scribble: { takes: 2, volume: 0.4 },
  rise: { takes: 2, volume: 0.3 },
} as const;

export type SfxName = keyof typeof LIBRARY;

/** Plays a sound effect `at` frames into the current shot. Takes vary so repeats sound natural. */
export function Sfx({ name, at, volume }: { name: SfxName; at: number; volume?: number }) {
  const { takes, volume: base } = LIBRARY[name];
  const take = (Math.abs(Math.round(at)) % takes) + 1;

  return (
    <Sequence from={Math.max(0, at)} durationInFrames={45} layout="none">
      <Audio src={staticFile(`sfx/${name}-${take}.wav`)} volume={volume ?? base} />
    </Sequence>
  );
}
