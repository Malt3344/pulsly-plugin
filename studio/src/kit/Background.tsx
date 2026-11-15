import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { useColors } from './theme';

/** Fine fibres and grain, so the paper tone reads as real paper. */
const PAPER_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 0.11 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

const STARS = Array.from({ length: 140 }, (_, index) => ({
  x: random(`star-x-${index}`) * 100,
  y: random(`star-y-${index}`) * 100,
  size: 1.5 + random(`star-s-${index}`) * 3,
  phase: random(`star-p-${index}`) * Math.PI * 2,
}));

function PaperBackground({ background }: { background: string }) {
  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <AbsoluteFill style={{ backgroundImage: PAPER_GRAIN, backgroundSize: '360px 360px' }} />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 85% 70% at 50% 40%, transparent 55%, rgba(80,60,35,0.10))',
        }}
      />
    </AbsoluteFill>
  );
}

/** Deep space with twinkling stars and two spotlight beams from above. */
export function SpaceBackground({ accent }: { accent: string }) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 30%, #0b1224, #04060d 70%)' }}>
      {STARS.map((star, index) => (
        <div
          // Stars are a fixed, generated list.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            background: '#dfe8ff',
            opacity: 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(frame / 20 + star.phase)),
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          background:
            'conic-gradient(from 168deg at 50% -8%, transparent 0deg, rgba(190,210,255,0.16) 10deg, rgba(190,210,255,0.05) 20deg, transparent 26deg)',
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 50% 14% at 50% 80%, ${accent}22, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
}

/**
 * Dark: near-black with a spotlight falling from the top onto the subject.
 * Light: warm off-white with a faint grid. Paper: grainy paper. Space: stars and beams.
 */
export function Background() {
  const { tone, background, faint, accent } = useColors();
  const frame = useCurrentFrame();
  const breathe = interpolate(Math.sin(frame / 45), [-1, 1], [0.85, 1]);

  if (tone === 'paper') {
    return <PaperBackground background={background} />;
  }
  if (tone === 'space') {
    return <SpaceBackground accent={accent} />;
  }

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
