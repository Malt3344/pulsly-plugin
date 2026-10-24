import { popIn, useEntrance } from '../components/animation';
import type { Visual } from '../schema';
import { fonts, textOn, usePalette } from '../theme';

type CtaSpec = Extract<Visual, { type: 'cta' }>;

/** Closing ask: comment a keyword to get something. */
export function CallToAction({
  spec,
  accent,
  delay,
}: {
  spec: CtaSpec;
  accent: string;
  delay: number;
}) {
  const colors = usePalette();
  const progress = useEntrance(delay, 10);

  return (
    <div
      style={{
        ...popIn(progress),
        textAlign: 'center',
        fontFamily: fonts.sans,
        color: colors.text,
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 700, color: colors.muted }}>Comment</div>
      <div
        style={{
          display: 'inline-block',
          margin: '24px 0 36px',
          padding: '10px 60px 22px',
          borderRadius: 34,
          background: accent,
          color: textOn(accent),
          fontSize: 200,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          boxShadow: `0 0 90px ${accent}66`,
        }}
      >
        {spec.keyword}
      </div>
      <div style={{ maxWidth: 860, fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>
        {spec.text}
      </div>
    </div>
  );
}
