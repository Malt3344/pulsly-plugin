import { Audio, Sequence, staticFile } from 'remotion';

export const SFX = ['whoosh', 'pop', 'click', 'tick', 'thud', 'ding'] as const;
export type SfxName = (typeof SFX)[number];

const VOLUME: Record<SfxName, number> = {
  whoosh: 0.32,
  pop: 0.28,
  click: 0.4,
  tick: 0.22,
  thud: 0.5,
  ding: 0.3,
};

/** Plays a sound effect `at` frames into the current shot. */
export function Sfx({ name, at, volume }: { name: SfxName; at: number; volume?: number }) {
  return (
    <Sequence from={Math.max(0, at)} durationInFrames={40} layout="none">
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume ?? VOLUME[name]} />
    </Sequence>
  );
}
