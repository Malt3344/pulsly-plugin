import type { CSSProperties, ReactNode } from 'react';
import { interpolate } from 'remotion';
import { Sfx } from './Sfx';
import { fonts, RED, useColors } from './theme';
import { useCue, type Cue } from './timing';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Draws an accent box around its children on a word, like a marker on a screenshot. */
export function Highlight({
  delay = 0,
  on,
  children,
  color,
  padding = 10,
  label,
}: {
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  children: ReactNode;
  color?: string;
  padding?: number;
  /** Small tag on the box's corner, e.g. "× loses" or "x2". */
  label?: string;
}) {
  const colors = useColors();
  const stroke = color ?? colors.accent;
  const { since, startFrame } = useCue(on, { delay });
  const draw = interpolate(since, [0, 12], [0, 1], clamp);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {on !== undefined && <Sfx name="tick" at={startFrame} />}
      {children}
      <span
        style={{
          position: 'absolute',
          inset: -padding,
          borderRadius: 14,
          border: `4px solid ${stroke}`,
          background: `${stroke}1c`,
          boxShadow: `0 0 16px ${stroke}66`,
          clipPath: `inset(0 ${(1 - draw) * 100}% 0 0 round 14px)`,
          pointerEvents: 'none',
        }}
      />
      {label && (
        <span
          style={{
            position: 'absolute',
            right: -padding - 6,
            top: -padding - 30,
            padding: '4px 12px',
            borderRadius: 999,
            background: stroke,
            color: '#fff',
            fontFamily: fonts.sans,
            fontSize: 22,
            fontWeight: 800,
            opacity: draw,
            transform: `scale(${0.6 + draw * 0.4})`,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

/** Strikes through its children on a word, in red unless told otherwise. */
export function Strike({
  delay = 0,
  on,
  children,
  color = RED,
}: {
  on?: Cue;
  delay?: number;
  children: ReactNode;
  color?: string;
}) {
  const { since, startFrame } = useCue(on, { delay });
  const draw = interpolate(since, [0, 8], [0, 1], clamp);

  return (
    <span style={{ position: 'relative', display: 'inline-block', opacity: 1 - draw * 0.35 }}>
      {on !== undefined && <Sfx name="scribble" at={startFrame} />}
      {children}
      <span
        style={{
          position: 'absolute',
          left: -6,
          right: -6,
          top: '52%',
          height: 7,
          borderRadius: 4,
          background: color,
          transform: `scaleX(${draw}) rotate(-3deg)`,
          transformOrigin: 'left center',
        }}
      />
    </span>
  );
}

/** A rubber stamp that slams down on a word: DONE, STOP, DRAFTED, SOLD… */
export function Stamp({
  delay = 0,
  on,
  children,
  color = RED,
  rotate = -12,
  size = 96,
  style,
}: {
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  children: ReactNode;
  color?: string;
  rotate?: number;
  size?: number;
  style?: CSSProperties;
}) {
  const { since, progress, startFrame } = useCue(on, { delay, damping: 11, mass: 0.5 });

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 5,
        padding: `${size * 0.08}px ${size * 0.28}px`,
        border: `${size * 0.08}px solid ${color}`,
        borderRadius: size * 0.16,
        color,
        fontFamily: fonts.sans,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        background: `${color}14`,
        opacity: since < 0 ? 0 : interpolate(progress, [0, 0.3], [0, 1], clamp),
        transform: `rotate(${rotate}deg) scale(${2.4 - progress * 1.4})`,
        mixBlendMode: 'normal',
        ...style,
      }}
    >
      {on !== undefined && <Sfx name="stamp" at={startFrame} />}
      {children}
    </div>
  );
}

/** A big red ✕ in a circle, for things that fail or should stop. */
export function Cross({
  delay = 0,
  on,
  size = 80,
  style,
}: {
  on?: Cue;
  delay?: number;
  size?: number;
  style?: CSSProperties;
}) {
  const { progress, startFrame } = useCue(on, { delay, damping: 12 });

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: RED,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.sans,
        fontWeight: 900,
        fontSize: size * 0.55,
        boxShadow: `0 0 ${size / 2}px ${RED}88`,
        transform: `scale(${progress})`,
        ...style,
      }}
    >
      {on !== undefined && <Sfx name="error" at={startFrame} />}✕
    </div>
  );
}

/** A tick in the accent colour that pops in on a word. */
export function Check({
  delay = 0,
  on,
  size = 48,
  style,
}: {
  on?: Cue;
  delay?: number;
  size?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const { progress, startFrame } = useCue(on, { delay, damping: 12 });

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 999,
        background: progress > 0.05 ? colors.accent : colors.faint,
        color: '#07110d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.6,
        fontWeight: 900,
        transform: `scale(${0.7 + progress * 0.3})`,
        ...style,
      }}
    >
      {on !== undefined && <Sfx name="tick" at={startFrame} />}
      <span style={{ opacity: progress }}>✓</span>
    </div>
  );
}

/**
 * A mouse pointer that glides from `from` to `to` (px on the parent) and clicks
 * on a word. Put it inside a Stage or a relatively positioned box.
 */
export function Cursor({
  delay = 0,
  from = [700, 900],
  to,
  on,
  click = true,
}: {
  from?: [number, number];
  to: [number, number];
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  click?: boolean;
}) {
  const { since, startFrame } = useCue(on, { delay });
  const travel = interpolate(since, [-18, 0], [0, 1], clamp);
  const ease = 1 - (1 - travel) ** 3;
  const x = from[0] + (to[0] - from[0]) * ease;
  const y = from[1] + (to[1] - from[1]) * ease;
  const press = click ? interpolate(since, [0, 3, 7], [1, 0.82, 1], clamp) : 1;
  const ripple = interpolate(since, [0, 14], [0, 1], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: 10,
        opacity: interpolate(since, [-24, -16], [0, 1], clamp),
      }}
    >
      {click && on !== undefined && <Sfx name="click" at={startFrame} />}
      {click && since >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: -40 * ripple,
            top: -40 * ripple,
            width: 80 * ripple,
            height: 80 * ripple,
            borderRadius: 999,
            border: '4px solid rgba(255,255,255,0.8)',
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg
        width={58}
        height={58}
        viewBox="0 0 24 24"
        style={{
          transform: `scale(${press})`,
          transformOrigin: 'top left',
          filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))',
        }}
      >
        <path
          d="M4 2 L4 19 L8.5 14.8 L11.4 21.4 L14.2 20.2 L11.4 13.8 L17.6 13.8 Z"
          fill="#ffffff"
          stroke="#111"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** A line that draws itself between two points (px on the parent), with an arrowhead. */
export function Arrow({
  delay = 0,
  from,
  to,
  on,
  color,
  curve = 0.25,
}: {
  from: [number, number];
  to: [number, number];
  on?: Cue;
  /** Extra frames after the cue. */
  delay?: number;
  color?: string;
  curve?: number;
}) {
  const colors = useColors();
  const stroke = color ?? colors.accent;
  const { since } = useCue(on, { delay });
  const draw = interpolate(since, [0, 14], [0, 1], clamp);
  const [x1, y1] = from;
  const [x2, y2] = to;
  const cx = (x1 + x2) / 2 - (y2 - y1) * curve;
  const cy = (y1 + y2) / 2 + (x2 - x1) * curve;
  const angle = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <path
        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
        fill="none"
        stroke={stroke}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="1"
        pathLength={1}
        strokeDashoffset={1 - draw}
      />
      <path
        d="M -18 -12 L 0 0 L -18 12"
        fill="none"
        stroke={stroke}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`translate(${x2} ${y2}) rotate(${angle})`}
        opacity={draw > 0.95 ? 1 : 0}
      />
    </svg>
  );
}
