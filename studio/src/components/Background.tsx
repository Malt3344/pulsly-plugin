import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { usePalette } from '../theme';

/** Near-black backdrop with a faint grid and a slowly drifting accent glow. */
export function Background({ accent }: { accent: string }) {
  const colors = usePalette();
  const frame = useCurrentFrame();
  const drift = interpolate(Math.sin(frame / 90), [-1, 1], [-60, 60]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + drift / 20}% ${48 + drift / 30}%, ${accent}26 0%, transparent 45%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, ${colors.vignette} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
}
