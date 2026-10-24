import { popIn, useEntrance } from '../components/animation';
import { fonts, textOn, usePalette } from '../theme';

const ITEM_INTERVAL = 8;

function ChecklistItem({ text, accent, delay }: { text: string; accent: string; delay: number }) {
  const progress = useEntrance(delay);

  return (
    <div style={{ ...popIn(progress, 24), display: 'flex', alignItems: 'center', gap: 28 }}>
      <span
        style={{
          width: 64,
          height: 64,
          flexShrink: 0,
          borderRadius: 999,
          background: accent,
          color: textOn(accent),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          fontWeight: 800,
        }}
      >
        ✓
      </span>
      <span>{text}</span>
    </div>
  );
}

/** Items that tick in one by one. */
export function Checklist({
  items,
  accent,
  delay,
}: {
  items: string[];
  accent: string;
  delay: number;
}) {
  const colors = usePalette();
  return (
    <div
      style={{
        width: 900,
        display: 'grid',
        gap: 34,
        padding: '44px 48px',
        borderRadius: 30,
        background: colors.panel,
        border: `2px solid ${colors.panelBorder}`,
        fontFamily: fonts.sans,
        fontSize: 52,
        fontWeight: 700,
        color: colors.text,
      }}
    >
      {items.map((item, index) => (
        <ChecklistItem
          key={item}
          text={item}
          accent={accent}
          delay={delay + index * ITEM_INTERVAL}
        />
      ))}
    </div>
  );
}
