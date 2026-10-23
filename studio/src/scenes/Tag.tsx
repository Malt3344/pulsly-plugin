import { popIn, useEntrance } from '../components/animation';
import { colors, fonts } from '../theme';

/** Small glowing chip, e.g. "● software company". */
export function Tag({ label, accent, delay }: { label: string; accent: string; delay: number }) {
  const progress = useEntrance(delay);

  return (
    <div
      style={{
        ...popIn(progress),
        display: 'inline-flex',
        alignItems: 'center',
        gap: 18,
        padding: '18px 34px',
        borderRadius: 999,
        background: colors.panel,
        border: `2px solid ${accent}66`,
        boxShadow: `0 0 40px ${accent}33`,
        fontFamily: fonts.sans,
        fontWeight: 700,
        fontSize: 48,
        color: colors.text,
      }}
    >
      <span style={{ width: 22, height: 22, borderRadius: 999, background: accent }} />
      {label}
    </div>
  );
}
