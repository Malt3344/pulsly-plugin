import { interpolate, useCurrentFrame } from 'remotion';
import { popIn, useEntrance } from '../components/animation';
import type { Visual } from '../schema';
import { colors, fonts } from '../theme';

type StatSpec = Extract<Visual, { type: 'stat' }>;

const COUNT_FRAMES = 24;

/** A big number that counts up, with a label underneath. */
export function Stat({ spec, accent, delay }: { spec: StatSpec; accent: string; delay: number }) {
  const frame = useCurrentFrame();
  const progress = useEntrance(delay);
  const value = interpolate(frame - delay, [0, COUNT_FRAMES], [0, spec.value], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const decimals = Number.isInteger(spec.value) ? 0 : 1;

  return (
    <div style={{ ...popIn(progress), textAlign: 'center', fontFamily: fonts.sans }}>
      <div
        style={{
          fontSize: 230,
          fontWeight: 800,
          letterSpacing: '-0.05em',
          color: accent,
          lineHeight: 1,
          textShadow: `0 0 80px ${accent}66`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {spec.prefix}
        {value.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {spec.suffix}
      </div>
      <div style={{ marginTop: 20, fontSize: 52, fontWeight: 700, color: colors.text }}>
        {spec.label}
      </div>
    </div>
  );
}
