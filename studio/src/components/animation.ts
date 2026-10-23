import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** 0 → 1 spring that starts `delay` frames into the current sequence. */
export const useEntrance = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.6 } });
};

/** Pop-in transform: rises, scales up and fades in as `progress` goes 0 → 1. */
export const popIn = (progress: number, distance = 40) => ({
  opacity: progress,
  transform: `translateY(${(1 - progress) * distance}px) scale(${0.92 + progress * 0.08})`,
});
