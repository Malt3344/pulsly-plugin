import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { popIn, useEntrance } from '../components/animation';
import type { Visual } from '../schema';
import { fonts, usePalette } from '../theme';

type ImageSpec = Extract<Visual, { type: 'image' }>;

/** A real product screen in a browser or phone frame, with a slow push-in. */
export function Screenshot({ spec, delay }: { spec: ImageSpec; delay: number }) {
  const colors = usePalette();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = useEntrance(delay);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  const image = (
    <Img
      src={staticFile(spec.src)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top',
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
      }}
    />
  );

  if (spec.frame === 'phone') {
    return (
      <div
        style={{
          ...popIn(progress, 80),
          width: 500,
          height: 1000,
          padding: 16,
          borderRadius: 72,
          background: '#0b0b0c',
          boxShadow: `0 40px 90px ${colors.shadow}`,
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: 58, overflow: 'hidden' }}>
          {image}
        </div>
      </div>
    );
  }

  if (spec.frame === 'none') {
    return (
      <div
        style={{
          ...popIn(progress, 60),
          width: 940,
          height: 700,
          borderRadius: 30,
          overflow: 'hidden',
          boxShadow: `0 40px 90px ${colors.shadow}`,
        }}
      >
        {image}
      </div>
    );
  }

  return (
    <div
      style={{
        ...popIn(progress, 60),
        width: 960,
        borderRadius: 26,
        overflow: 'hidden',
        background: colors.panel,
        border: `2px solid ${colors.panelBorder}`,
        boxShadow: `0 40px 90px ${colors.shadow}`,
        fontFamily: fonts.sans,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 22px',
          borderBottom: `2px solid ${colors.panelBorder}`,
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
          <span
            key={color}
            style={{ width: 18, height: 18, borderRadius: 999, background: color }}
          />
        ))}
        {spec.url && (
          <span
            style={{
              marginLeft: 18,
              flex: 1,
              padding: '6px 18px',
              borderRadius: 999,
              background: colors.panelBorder,
              color: colors.muted,
              fontSize: 24,
            }}
          >
            {spec.url}
          </span>
        )}
      </div>
      <div style={{ height: 620, overflow: 'hidden' }}>{image}</div>
    </div>
  );
}
