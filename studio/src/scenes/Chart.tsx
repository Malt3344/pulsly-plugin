import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { popIn, useEntrance } from '../components/animation';
import type { Visual } from '../schema';
import { fonts, usePalette } from '../theme';

type ChartSpec = Extract<Visual, { type: 'chart' }>;

const WIDTH = 860;
const HEIGHT = 380;
const DRAW_FRAMES = 30;

/** A line that draws itself or bars that grow, ending on a highlighted value. */
export function Chart({ spec, accent, delay }: { spec: ChartSpec; accent: string; delay: number }) {
  const colors = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = useEntrance(delay);
  const draw = interpolate(frame - delay - 4, [0, DRAW_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const max = Math.max(...spec.values);
  const min = Math.min(0, ...spec.values);
  const y = (value: number) => HEIGHT - ((value - min) / (max - min || 1)) * (HEIGHT - 40);
  const step = WIDTH / (spec.values.length - 1 || 1);
  const last = spec.values[spec.values.length - 1]!;
  const linePath = spec.values
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${y(value)}`)
    .join(' ');

  return (
    <div
      style={{
        ...popIn(progress),
        width: WIDTH + 80,
        padding: '36px 40px 32px',
        borderRadius: 30,
        background: colors.panel,
        border: `2px solid ${colors.panelBorder}`,
        boxShadow: `0 30px 80px ${colors.shadow}`,
        fontFamily: fonts.sans,
      }}
    >
      <svg width={WIDTH} height={HEIGHT} style={{ overflow: 'visible' }}>
        {spec.kind === 'bar' ? (
          spec.values.map((value, index) => {
            const barWidth = (WIDTH / spec.values.length) * 0.62;
            const grow = spring({
              frame: frame - delay - 4 - index * 3,
              fps,
              config: { damping: 15 },
            });
            const height = (HEIGHT - y(value)) * grow;

            return (
              <rect
                // Bars are positional: their index is their identity.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                x={(index * WIDTH) / spec.values.length + barWidth * 0.3}
                y={HEIGHT - height}
                width={barWidth}
                height={height}
                rx={12}
                fill={index === spec.values.length - 1 ? accent : `${accent}55`}
              />
            );
          })
        ) : (
          <>
            <path
              d={`${linePath} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
              fill={`${accent}22`}
              opacity={draw}
            />
            <path
              d={linePath}
              fill="none"
              stroke={accent}
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
            <circle cx={WIDTH} cy={y(last)} r={16 * draw} fill={accent} />
          </>
        )}
      </svg>
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          color: colors.text,
        }}
      >
        <span style={{ fontSize: 40, fontWeight: 700, color: colors.muted }}>{spec.label}</span>
        <span style={{ fontSize: 76, fontWeight: 800, color: accent, opacity: draw }}>
          {spec.prefix}
          {last.toLocaleString('en-US')}
          {spec.suffix}
        </span>
      </div>
    </div>
  );
}
