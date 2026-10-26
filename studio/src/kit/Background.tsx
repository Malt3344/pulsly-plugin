import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { useColors } from './theme';

/**
 * Dark: near-black with a spotlight falling from the top onto the subject.
 * Light: warm off-white with a faint grid, like paper.
 */
export function Background() {
  const { tone, background, faint, accent } = useColors();
  const frame = useCurrentFrame();
  const breathe = interpolate(Math.sin(frame / 45), [-1, 1], [0.85, 1]);

  if (tone === 'light') {
    return (
      <AbsoluteFill style={{ backgroundColor: background }}>
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${faint} 2px, transparent 2px), linear-gradient(90deg, ${faint} 2px, transparent 2px)`,
            backgroundSize: '90px 90px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, black 30%, transparent 85%)',
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <AbsoluteFill
        style={{
          opacity: breathe,
          background:
            'radial-gradient(ellipse 34% 62% at 50% -6%, rgba(255,255,255,0.13), rgba(255,255,255,0.04) 55%, transparent 75%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 45% 18% at 50% 74%, ${accent}1f, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${faint} 2px, transparent 2px), linear-gradient(90deg, ${faint} 2px, transparent 2px)`,
          backgroundSize: '90px 90px',
          opacity: 0.35,
          maskImage: 'radial-gradient(ellipse 60% 45% at 50% 50%, black, transparent 80%)',
        }}
      />
    </AbsoluteFill>
  );
}
