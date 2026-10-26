import { popIn, useEntrance } from '../components/animation';
import type { Visual } from '../schema';
import { fonts, textOn, usePalette } from '../theme';

type CompareSpec = Extract<Visual, { type: 'compare' }>;

interface ColumnProps {
  title: string;
  items: string[];
  good: boolean;
  accent: string;
  delay: number;
}

function Column({ title, items, good, accent, delay }: ColumnProps) {
  const colors = usePalette();
  const progress = useEntrance(delay);
  const mark = good ? accent : '#ff5b5b';

  return (
    <div
      style={{
        ...popIn(progress, 60),
        flex: 1,
        display: 'grid',
        alignContent: 'start',
        gap: 26,
        padding: '34px 30px',
        borderRadius: 28,
        background: colors.panel,
        border: `3px solid ${good ? accent : colors.panelBorder}`,
        boxShadow: good ? `0 0 60px ${accent}40` : 'none',
        opacity: good ? progress : progress * 0.85,
      }}
    >
      <span
        style={{
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: good ? accent : colors.muted,
        }}
      >
        {title}
      </span>
      {items.map((item) => (
        <div
          key={item}
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: 46,
              height: 46,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: mark,
              color: good ? textOn(accent) : '#ffffff',
              fontSize: 28,
            }}
          >
            {good ? '✓' : '✕'}
          </span>
          <span style={{ color: good ? colors.text : colors.muted, lineHeight: 1.15 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

/** Before vs. after: the old way crossed out, the new way highlighted. */
export function Compare({
  spec,
  accent,
  delay,
}: {
  spec: CompareSpec;
  accent: string;
  delay: number;
}) {
  return (
    <div style={{ width: 940, display: 'flex', gap: 24, fontFamily: fonts.sans }}>
      <Column {...spec.before} good={false} accent={accent} delay={delay} />
      <Column {...spec.after} good accent={accent} delay={delay + 12} />
    </div>
  );
}
