import type { CSSProperties, ReactNode } from 'react';
import { interpolate } from 'remotion';
import { Sfx, type SfxName } from './Sfx';
import { useCue, type Cue } from './timing';

export const APPEARS = ['pop', 'rise', 'drop', 'left', 'right', 'fade', 'zoom'] as const;
export type AppearStyle = (typeof APPEARS)[number];

const appearTransform = (style: AppearStyle, p: number) => {
  switch (style) {
    case 'pop':
      return `scale(${0.55 + p * 0.45})`;
    case 'drop':
      return `translateY(${(1 - p) * -140}px)`;
    case 'left':
      return `translateX(${(1 - p) * -220}px)`;
    case 'right':
      return `translateX(${(1 - p) * 220}px)`;
    case 'zoom':
      return `scale(${1.6 - p * 0.6})`;
    case 'fade':
      return 'none';
    default:
      return `translateY(${(1 - p) * 70}px)`;
  }
};

interface AppearProps {
  /** The word (or seconds) that brings this in. Without it, it is there from the shot start. */
  on?: Cue;
  /** Extra frames after the cue, e.g. to stagger items. */
  delay?: number;
  as?: AppearStyle;
  /** Sound when it appears; `false` for none. Defaults to a pop for pop/drop/zoom. */
  sound?: SfxName | false;
  /** The word that makes it leave again. */
  until?: Cue;
  style?: CSSProperties;
  children: ReactNode;
}

/** Brings its children in on a spoken word — the core of "picture on its word". */
export function Appear({ on, delay = 0, as = 'rise', sound, until, style, children }: AppearProps) {
  const { progress, startFrame } = useCue(on, { delay, damping: as === 'drop' ? 10 : 14 });
  const leave = useCue(until ?? 1e6, { damping: 20 });
  const visible = until === undefined ? progress : progress * (1 - leave.progress);
  const effect = sound ?? (['pop', 'drop', 'zoom'].includes(as) ? 'pop' : false);

  return (
    <div
      style={{
        opacity: interpolate(visible, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' }),
        transform: appearTransform(as, visible),
        ...style,
      }}
    >
      {on !== undefined && effect && <Sfx name={effect} at={startFrame} />}
      {children}
    </div>
  );
}

/** Children that keep moving gently, so nothing on screen is ever still. */
export function Float({
  children,
  amount = 10,
  speed = 1,
  style,
}: {
  children: ReactNode;
  amount?: number;
  speed?: number;
  style?: CSSProperties;
}) {
  const { since } = useCue(undefined);
  const y = Math.sin((since / 30) * speed * 1.4) * amount;
  const r = Math.sin((since / 30) * speed * 0.9) * (amount / 10);

  return (
    <div style={{ transform: `translateY(${y}px) rotate(${r}deg)`, ...style }}>{children}</div>
  );
}

/** Lays out children absolutely on a fixed-size stage, for composing illustrations. */
export function Stage({
  width = 920,
  height = 1000,
  children,
  style,
}: {
  width?: number;
  height?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return <div style={{ position: 'relative', width, height, ...style }}>{children}</div>;
}

/** Absolutely positions its children on a Stage. */
export function At({
  x,
  y,
  children,
  style,
}: {
  x: number;
  y: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return <div style={{ position: 'absolute', left: x, top: y, ...style }}>{children}</div>;
}
