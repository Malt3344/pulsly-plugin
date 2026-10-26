import { popIn, useEntrance } from '../components/animation';
import type { Visual } from '../schema';
import { fonts, textOn, usePalette } from '../theme';

type QuoteSpec = Extract<Visual, { type: 'quote' }>;

/** A customer quote: the strongest proof is someone else saying it. */
export function Quote({ spec, accent, delay }: { spec: QuoteSpec; accent: string; delay: number }) {
  const colors = usePalette();
  const progress = useEntrance(delay);

  return (
    <div
      style={{
        ...popIn(progress, 50),
        width: 920,
        padding: '48px 52px',
        borderRadius: 32,
        background: colors.panel,
        border: `2px solid ${colors.panelBorder}`,
        boxShadow: `0 30px 80px ${colors.shadow}`,
        fontFamily: fonts.sans,
        color: colors.text,
      }}
    >
      <div style={{ fontSize: 140, lineHeight: 0.6, fontWeight: 800, color: accent }}>“</div>
      <p style={{ margin: '12px 0 36px', fontSize: 52, fontWeight: 700, lineHeight: 1.22 }}>
        {spec.text}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span
          style={{
            width: 72,
            height: 72,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: accent,
            color: textOn(accent),
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          {spec.author.charAt(0).toUpperCase()}
        </span>
        <span style={{ display: 'grid' }}>
          <span style={{ fontSize: 36, fontWeight: 700 }}>{spec.author}</span>
          {spec.role && <span style={{ fontSize: 30, color: colors.muted }}>{spec.role}</span>}
        </span>
      </div>
    </div>
  );
}
