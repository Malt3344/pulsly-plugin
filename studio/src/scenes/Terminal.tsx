import { useCurrentFrame } from 'remotion';
import { popIn, useEntrance } from '../components/animation';
import type { Visual } from '../schema';
import { fonts, usePalette } from '../theme';

type TerminalSpec = Extract<Visual, { type: 'terminal' }>;

const LINE_INTERVAL = 9;

/** Agent-style log where lines appear one after another. */
export function Terminal({
  spec,
  accent,
  delay,
}: {
  spec: TerminalSpec;
  accent: string;
  delay: number;
}) {
  const colors = usePalette();
  const frame = useCurrentFrame();
  const progress = useEntrance(delay);
  const visibleLines = Math.max(0, Math.floor((frame - delay - 6) / LINE_INTERVAL) + 1);
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        ...popIn(progress),
        width: 900,
        borderRadius: 26,
        background: colors.panel,
        border: `2px solid ${colors.panelBorder}`,
        boxShadow: `0 30px 80px ${colors.shadow}`,
        fontFamily: fonts.mono,
        fontSize: 32,
        color: colors.text,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '22px 30px',
          borderBottom: `2px solid ${colors.panelBorder}`,
          fontSize: 26,
          letterSpacing: '0.08em',
          color: colors.muted,
        }}
      >
        <span>{spec.header}</span>
        <span style={{ color: accent }}>{spec.status}</span>
      </div>
      <div style={{ padding: '18px 30px 26px', display: 'grid', gap: 18 }}>
        {spec.lines.slice(0, visibleLines).map((line) => (
          <div key={line.text} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <span
              style={{
                padding: '4px 14px',
                borderRadius: 8,
                background: `${accent}22`,
                color: accent,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {line.badge}
            </span>
            <span style={{ flex: 1 }}>{line.text}</span>
            {line.time && <span style={{ color: colors.muted, fontSize: 26 }}>{line.time}</span>}
          </div>
        ))}
        <span style={{ width: 18, height: 34, background: cursorOn ? accent : 'transparent' }} />
      </div>
    </div>
  );
}
