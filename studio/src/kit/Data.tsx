import type { CSSProperties } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sfx } from './Sfx';
import { fonts, textOn, useColors } from './theme';
import { useCue, type Cue } from './timing';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const format = (value: number, decimals: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** A number that counts from `from` to `to`, starting on a word. Ticks while it runs. */
export function Counter({
  delay = 0,
  to,
  from = 0,
  on,
  frames = 24,
  prefix = '',
  suffix = '',
  decimals = 0,
  size = 120,
  color,
  style,
}: {
  to: number;
  from?: number;
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  /** How long the count takes. */
  frames?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const { since, startFrame } = useCue(on, { delay });
  const t = interpolate(since, [0, frames], [0, 1], clamp);
  const value = from + (to - from) * (1 - (1 - t) ** 3);

  return (
    <span
      style={{
        fontFamily: fonts.sans,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: '-0.04em',
        color: color ?? colors.text,
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {on !== undefined &&
        [0, 6, 12, 18].map((offset) => (
          <Sfx key={offset} name="tick" at={startFrame + offset} volume={0.12} />
        ))}
      {prefix}
      {format(value, decimals)}
      {suffix}
    </span>
  );
}

/** Huge display text for the one word or number that matters: "5M", "221 FILES". */
export function Big({
  delay = 0,
  children,
  on,
  size = 260,
  color,
  outline,
  style,
}: {
  children: string;
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  size?: number;
  color?: string;
  /** Outlined letters with a glow instead of solid fill. */
  outline?: boolean;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const fill = color ?? colors.text;
  const { progress, startFrame } = useCue(on, { delay, damping: 11 });

  return (
    <div
      style={{
        fontFamily: fonts.sans,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: '-0.05em',
        color: outline ? 'transparent' : fill,
        WebkitTextStroke: outline ? `${size / 40}px ${fill}` : undefined,
        textShadow: outline ? `0 0 ${size / 6}px ${fill}66` : undefined,
        transform: `scale(${0.7 + progress * 0.3})`,
        opacity: progress,
        textAlign: 'center',
        ...style,
      }}
    >
      {on !== undefined && <Sfx name="rise" at={startFrame} />}
      {children}
    </div>
  );
}

/** Bars that grow one after another; the last one is highlighted. */
export function Bars({
  delay = 0,
  values,
  on,
  width = 820,
  height = 420,
  labels,
  style,
}: {
  values: number[];
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  width?: number;
  height?: number;
  labels?: string[];
  style?: CSSProperties;
}) {
  const colors = useColors();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { startFrame } = useCue(on, { delay });
  const max = Math.max(...values);
  const slot = width / values.length;

  return (
    <div
      style={{ position: 'relative', width, height: height + 50, fontFamily: fonts.sans, ...style }}
    >
      {values.map((value, index) => {
        const grow = spring({
          frame: frame - startFrame - index * 4,
          fps,
          config: { damping: 15 },
        });
        const barHeight = (value / max) * height * grow;
        const last = index === values.length - 1;

        return (
          // Bars are positional: their index is their identity.
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <div
              style={{
                position: 'absolute',
                left: index * slot + slot * 0.18,
                bottom: 50,
                width: slot * 0.64,
                height: barHeight,
                borderRadius: 14,
                background: last ? colors.accent : `${colors.accent}44`,
                boxShadow: last ? `0 0 40px ${colors.accent}66` : 'none',
              }}
            />
            {labels?.[index] && (
              <div
                style={{
                  position: 'absolute',
                  left: index * slot,
                  bottom: 0,
                  width: slot,
                  textAlign: 'center',
                  fontSize: 24,
                  color: colors.muted,
                }}
              >
                {labels[index]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** A line that draws itself left to right with a glowing end point. */
export function LineChart({
  delay = 0,
  values,
  on,
  width = 820,
  height = 380,
  frames = 36,
  style,
}: {
  values: number[];
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  width?: number;
  height?: number;
  frames?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const { since } = useCue(on, { delay });
  const draw = interpolate(since, [0, frames], [0, 1], clamp);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const x = (index: number) => (index / (values.length - 1)) * width;
  const y = (value: number) => height - ((value - min) / (max - min || 1)) * (height - 30) - 15;
  const path = values
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(value)}`)
    .join(' ');
  const endIndex = Math.min(values.length - 1, Math.floor(draw * (values.length - 1) + 0.0001));

  return (
    <svg width={width} height={height} style={{ overflow: 'visible', ...style }}>
      {[0.25, 0.5, 0.75].map((line) => (
        <line
          key={line}
          x1={0}
          x2={width}
          y1={height * line}
          y2={height * line}
          stroke={colors.faint}
          strokeWidth={2}
        />
      ))}
      <path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill={`${colors.accent}22`}
        style={{ clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)` }}
      />
      <path
        d={path}
        fill="none"
        stroke={colors.accent}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      {draw > 0 && (
        <circle
          cx={x(endIndex)}
          cy={y(values[endIndex]!)}
          r={14}
          fill={colors.accent}
          style={{ filter: `drop-shadow(0 0 12px ${colors.accent})` }}
        />
      )}
    </svg>
  );
}

/** A dial whose needle swings to `value` (0–1) on a word. */
export function Gauge({
  delay = 0,
  value,
  on,
  size = 360,
  label,
  style,
}: {
  value: number;
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  size?: number;
  label?: string;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const { progress } = useCue(on, { delay, damping: 9 });
  const angle = -120 + 240 * value * progress;
  const r = size / 2 - 20;

  return (
    <div style={{ width: size, textAlign: 'center', fontFamily: fonts.sans, ...style }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill={colors.panel}
          stroke={colors.border}
          strokeWidth={6}
        />
        {Array.from({ length: 13 }, (_, tick) => {
          const a = ((-120 + tick * 20 - 90) * Math.PI) / 180;
          return (
            <line
              key={tick}
              x1={size / 2 + Math.cos(a) * (r - 14)}
              y1={size / 2 + Math.sin(a) * (r - 14)}
              x2={size / 2 + Math.cos(a) * (r - 34)}
              y2={size / 2 + Math.sin(a) * (r - 34)}
              stroke={tick / 12 <= value ? colors.accent : colors.muted}
              strokeWidth={5}
              strokeLinecap="round"
            />
          );
        })}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2}
          y2={size / 2 - r + 50}
          stroke={colors.accent}
          strokeWidth={10}
          strokeLinecap="round"
          transform={`rotate(${angle} ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 10px ${colors.accent})` }}
        />
        <circle cx={size / 2} cy={size / 2} r={18} fill={colors.accent} />
      </svg>
      {label && (
        <div style={{ marginTop: 10, fontSize: 34, fontWeight: 800, color: colors.text }}>
          {label}
        </div>
      )}
    </div>
  );
}

/** A stack of coins that grows to `count`, coin by coin, with a ding at the end. */
export function Coins({
  delay = 0,
  count,
  on,
  style,
}: {
  count: number;
  on?: Cue;
  delay?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const { since, startFrame } = useCue(on, { delay });
  const shown = Math.max(0, Math.min(count, Math.floor(since / 3) + 1));

  return (
    <div style={{ position: 'relative', width: 220, height: 40 + count * 26, ...style }}>
      {on !== undefined && <Sfx name="ding" at={startFrame + count * 3} />}
      {Array.from({ length: shown }, (_, index) => (
        <div
          // Coins are positional: their index is their identity.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          style={{
            position: 'absolute',
            bottom: index * 26,
            left: 0,
            width: 220,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(180deg, ${colors.accent}, ${colors.accent}aa)`,
            border: `4px solid ${textOn(colors.accent) === '#ffffff' ? '#ffffff55' : '#00000033'}`,
            boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
          }}
        />
      ))}
    </div>
  );
}

/** A horizontal bar filling to `value` (0–1) on a word, e.g. "AI 92%". */
export function Meter({
  delay = 0,
  value,
  on,
  width = 760,
  label,
  style,
}: {
  value: number;
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  width?: number;
  label?: string;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const { progress } = useCue(on, { delay, damping: 18 });

  return (
    <div style={{ width, fontFamily: fonts.sans, ...style }}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 28,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 12,
          }}
        >
          <span>{label}</span>
          <span style={{ color: colors.accent }}>{Math.round(value * progress * 100)}%</span>
        </div>
      )}
      <div style={{ height: 22, borderRadius: 999, background: colors.faint, overflow: 'hidden' }}>
        <div
          style={{
            width: `${value * progress * 100}%`,
            height: '100%',
            borderRadius: 999,
            background: colors.accent,
            boxShadow: `0 0 20px ${colors.accent}`,
          }}
        />
      </div>
    </div>
  );
}
