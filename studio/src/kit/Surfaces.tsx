import type { CSSProperties, ReactNode } from 'react';
import { fonts, RED, textOn, useColors, GREEN } from './theme';

/** An app or browser window: the main canvas for product illustrations. */
export function Window({
  children,
  width = 940,
  url,
  title,
  tilt = 0,
  style,
}: {
  children: ReactNode;
  width?: number;
  /** Shows an address bar, e.g. "app.pulsly.co". */
  url?: string;
  /** App name in the title bar when there is no url. */
  title?: string;
  /** Degrees of 3D tilt for depth, e.g. 8. */
  tilt?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();

  return (
    <div
      style={{
        width,
        borderRadius: 26,
        overflow: 'hidden',
        background: colors.panel,
        border: `2px solid ${colors.border}`,
        boxShadow: `0 50px 100px -30px ${colors.shadow}, 0 0 0 1px ${colors.border}`,
        fontFamily: fonts.sans,
        color: colors.text,
        transform: tilt
          ? `perspective(1800px) rotateX(${tilt}deg) rotateY(${-tilt * 0.6}deg)`
          : undefined,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '16px 20px',
          borderBottom: `2px solid ${colors.border}`,
          background: colors.panelRaised,
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
          <span
            key={color}
            style={{ width: 15, height: 15, borderRadius: 999, background: color }}
          />
        ))}
        {(url || title) && (
          <span
            style={{
              marginLeft: 16,
              flex: url ? 1 : undefined,
              padding: url ? '6px 18px' : 0,
              borderRadius: 999,
              background: url ? colors.faint : 'transparent',
              color: colors.muted,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {url ?? title}
          </span>
        )}
      </div>
      <div style={{ padding: 28 }}>{children}</div>
    </div>
  );
}

/** A phone, for mobile apps, DMs and notifications. */
export function Phone({
  children,
  width = 470,
  style,
}: {
  children: ReactNode;
  width?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();

  return (
    <div
      style={{
        width,
        height: width * 2.05,
        padding: 14,
        borderRadius: 74,
        background: '#0b0b0c',
        boxShadow: `0 60px 110px -30px ${colors.shadow}, inset 0 0 0 3px #2a2a2c`,
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 60,
          overflow: 'hidden',
          background: colors.panel,
          fontFamily: fonts.sans,
          color: colors.text,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            width: 130,
            height: 36,
            marginLeft: -65,
            borderRadius: 999,
            background: '#0b0b0c',
            zIndex: 2,
          }}
        />
        <div style={{ padding: '76px 26px 26px', height: '100%', boxSizing: 'border-box' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** A raised card for grouping content. */
export function Card({
  children,
  style,
  glow,
}: {
  children: ReactNode;
  style?: CSSProperties;
  glow?: boolean;
}) {
  const colors = useColors();

  return (
    <div
      style={{
        padding: 26,
        borderRadius: 22,
        background: colors.panel,
        border: `2px solid ${glow ? colors.accent : colors.border}`,
        boxShadow: glow ? `0 0 50px ${colors.accent}44` : `0 24px 50px -20px ${colors.shadow}`,
        fontFamily: fonts.sans,
        color: colors.text,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const PILL_COLORS = { red: RED, green: GREEN } as const;

/** A small rounded label: status, category, price… */
export function Pill({
  children,
  variant = 'accent',
  size = 26,
  style,
}: {
  children: ReactNode;
  variant?: 'accent' | 'solid' | 'neutral' | 'red' | 'green';
  size?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const base = variant === 'red' || variant === 'green' ? PILL_COLORS[variant] : colors.accent;
  const solid = variant === 'solid';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: `${size * 0.22}px ${size * 0.6}px`,
        borderRadius: 999,
        fontFamily: fonts.sans,
        fontSize: size,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: variant === 'neutral' ? colors.faint : solid ? base : `${base}22`,
        color: variant === 'neutral' ? colors.muted : solid ? textOn(base) : base,
        border: variant === 'neutral' ? `2px solid ${colors.border}` : `2px solid ${base}55`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** A round avatar with initials (or an image from public/). */
export function Avatar({
  name,
  size = 64,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const colors = useColors();
  const background = color ?? colors.accent;
  const initials = name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        color: textOn(background),
        fontFamily: fonts.sans,
        fontWeight: 800,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </span>
  );
}

/** A list row: avatar or icon, title, subtitle and something on the right. */
export function Row({
  leading,
  title,
  subtitle,
  trailing,
  style,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  style?: CSSProperties;
}) {
  const colors = useColors();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '16px 18px',
        borderRadius: 16,
        background: colors.panelRaised,
        border: `2px solid ${colors.border}`,
        fontFamily: fonts.sans,
        ...style,
      }}
    >
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: colors.text }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 22, color: colors.muted, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {trailing}
    </div>
  );
}

/** Body text inside surfaces, sized for a phone screen. */
export function Text({
  children,
  size = 30,
  weight = 600,
  muted,
  style,
}: {
  children: ReactNode;
  size?: number;
  weight?: number;
  muted?: boolean;
  style?: CSSProperties;
}) {
  const colors = useColors();

  return (
    <div
      style={{
        fontFamily: fonts.sans,
        fontSize: size,
        fontWeight: weight,
        color: muted ? colors.muted : colors.text,
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
