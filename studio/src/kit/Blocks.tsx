import type { CSSProperties } from 'react';
import { useCurrentFrame } from 'remotion';
import { Check } from './Annotate';
import { Appear } from './Motion';
import { Sfx } from './Sfx';
import { Avatar } from './Surfaces';
import { fonts, textOn, useColors } from './theme';
import { useCue, type Cue } from './timing';

/** Items that tick off one by one, each on its own word. */
export function Checklist({
  items,
  width = 820,
  style,
}: {
  items: { text: string; on?: Cue }[];
  width?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();

  return (
    <div style={{ width, display: 'grid', gap: 18, fontFamily: fonts.sans, ...style }}>
      {items.map((item) => (
        <Appear key={item.text} on={item.on} as="left" sound={false}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              padding: '22px 26px',
              borderRadius: 20,
              background: colors.panel,
              border: `2px solid ${colors.border}`,
              fontSize: 40,
              fontWeight: 700,
              color: colors.text,
            }}
          >
            <Check on={item.on} size={52} />
            {item.text}
          </div>
        </Appear>
      ))}
    </div>
  );
}

/** An agent log: lines appear on their words, with a status badge and a blinking cursor. */
export function Terminal({
  header,
  status,
  lines,
  width = 900,
  style,
}: {
  header: string;
  status?: string;
  lines: { text: string; on?: Cue; badge?: string; time?: string }[];
  width?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width,
        borderRadius: 24,
        overflow: 'hidden',
        background: colors.tone === 'dark' ? '#0b1012' : '#14181a',
        border: '2px solid rgba(255,255,255,0.1)',
        boxShadow: `0 40px 90px -30px ${colors.shadow}`,
        fontFamily: fonts.mono,
        color: '#ffffff',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '18px 26px',
          borderBottom: '2px solid rgba(255,255,255,0.08)',
          fontSize: 22,
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        <span>{header}</span>
        {status && <span style={{ color: colors.accent }}>● {status}</span>}
      </div>
      <div style={{ padding: '18px 26px 24px', display: 'grid', gap: 16 }}>
        {lines.map((line) => (
          <Appear key={line.text} on={line.on} as="fade" sound="tick">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 28 }}>
              <span
                style={{
                  padding: '3px 12px',
                  borderRadius: 8,
                  background: `${colors.accent}26`,
                  color: colors.accent,
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {line.badge ?? 'DONE'}
              </span>
              <span style={{ flex: 1 }}>{line.text}</span>
              {line.time && (
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 22 }}>{line.time}</span>
              )}
            </div>
          </Appear>
        ))}
        <span
          style={{
            width: 16,
            height: 30,
            background: Math.floor(frame / 15) % 2 ? colors.accent : 'transparent',
          }}
        />
      </div>
    </div>
  );
}

/** Lock-screen notifications sliding in from the top, newest on top. */
export function Notifications({
  items,
  width = 880,
  style,
}: {
  items: { app: string; text: string; time?: string; on?: Cue; color?: string }[];
  width?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();

  return (
    <div style={{ width, display: 'grid', gap: 16, fontFamily: fonts.sans, ...style }}>
      {items.map((item) => (
        <Appear key={`${item.app}-${item.text}`} on={item.on} as="drop">
          <div
            style={{
              display: 'flex',
              gap: 20,
              alignItems: 'center',
              padding: '22px 26px',
              borderRadius: 32,
              background: 'rgba(245,245,247,0.94)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              color: '#111',
            }}
          >
            <span
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: item.color ?? colors.accent,
                color: textOn(item.color ?? colors.accent),
                fontSize: 38,
                fontWeight: 800,
              }}
            >
              {item.app.charAt(0).toUpperCase()}
            </span>
            <span style={{ flex: 1, display: 'grid', gap: 2 }}>
              <span
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 24,
                  color: '#6b6b6b',
                }}
              >
                <span
                  style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
                  {item.app}
                </span>
                <span>{item.time ?? 'now'}</span>
              </span>
              <span style={{ fontSize: 34, fontWeight: 700 }}>{item.text}</span>
            </span>
          </div>
        </Appear>
      ))}
    </div>
  );
}

/** "HELLO my name is" name tag that slaps on: perfect for reframes ("…services firm"). */
export function Sticker({
  delay = 0,
  name,
  on,
  top = 'HELLO',
  subtitle = 'my name is',
  style,
}: {
  name: string;
  on?: Cue;
  delay?: number;
  top?: string;
  subtitle?: string;
  style?: CSSProperties;
}) {
  const colors = useColors();
  const { progress, startFrame } = useCue(on, { delay, damping: 10 });

  return (
    <div
      style={{
        width: 720,
        borderRadius: 30,
        overflow: 'hidden',
        background: '#f4f4f0',
        boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
        fontFamily: fonts.sans,
        opacity: progress,
        transform: `rotate(${-16 + progress * 9}deg) scale(${1.5 - progress * 0.5})`,
        ...style,
      }}
    >
      {on !== undefined && <Sfx name="thud" at={startFrame} />}
      <div
        style={{
          background: colors.accent,
          padding: '24px 0 14px',
          textAlign: 'center',
          color: textOn(colors.accent),
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>
          {top}
        </div>
        <div style={{ fontSize: 40, fontWeight: 700 }}>{subtitle}</div>
      </div>
      <div
        style={{
          padding: '44px 30px 50px',
          textAlign: 'center',
          fontSize: 72,
          fontWeight: 800,
          color: '#111',
          letterSpacing: '-0.03em',
        }}
      >
        {name}
      </div>
    </div>
  );
}

/** A customer quote — proof in someone else's words. */
export function Quote({
  delay = 0,
  text,
  author,
  role,
  on,
  style,
}: {
  text: string;
  author: string;
  role?: string;
  on?: Cue;
  delay?: number;
  style?: CSSProperties;
}) {
  const colors = useColors();

  return (
    <Appear on={on} delay={delay} as="rise" style={style}>
      <div
        style={{
          width: 880,
          padding: '44px 48px',
          borderRadius: 30,
          background: colors.panel,
          border: `2px solid ${colors.border}`,
          boxShadow: `0 30px 80px -30px ${colors.shadow}`,
          fontFamily: fonts.sans,
          color: colors.text,
        }}
      >
        <div style={{ fontSize: 130, lineHeight: 0.6, fontWeight: 900, color: colors.accent }}>
          “
        </div>
        <p style={{ margin: '10px 0 32px', fontSize: 48, fontWeight: 700, lineHeight: 1.22 }}>
          {text}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Avatar name={author} size={68} />
          <span style={{ display: 'grid' }}>
            <span style={{ fontSize: 32, fontWeight: 700 }}>{author}</span>
            {role && <span style={{ fontSize: 26, color: colors.muted }}>{role}</span>}
          </span>
        </div>
      </div>
    </Appear>
  );
}

/** The closing ask: a glowing keyword, the reward, and comments pouring in so the end never stands still. */
export function Comment({
  keyword,
  reward,
  on,
  delay = 0,
  comments = [`${keyword} 🔥`, 'need this', keyword, `${keyword} please 🙏`, keyword],
  style,
}: {
  keyword: string;
  reward: string;
  on?: Cue;
  delay?: number;
  /** Comments that pop in one after another after the reward. */
  comments?: string[];
  style?: CSSProperties;
}) {
  const colors = useColors();
  const { progress, since } = useCue(on, { delay, damping: 10 });
  const pulse = 1 + Math.sin(since / 6) * 0.015;

  return (
    <div
      style={{ display: 'grid', justifyItems: 'center', gap: 30, fontFamily: fonts.sans, ...style }}
    >
      <div style={{ fontSize: 56, fontWeight: 700, color: colors.muted }}>Comment</div>
      <div
        style={{
          padding: '10px 70px 22px',
          borderRadius: 34,
          border: `6px solid ${colors.accent}`,
          background: `${colors.accent}1f`,
          color: colors.accent,
          fontSize: 210,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          boxShadow: `0 0 ${90 * progress}px ${colors.accent}77, inset 0 0 40px ${colors.accent}33`,
          transform: `scale(${(0.7 + progress * 0.3) * pulse})`,
        }}
      >
        {keyword}
      </div>
      <Appear on={on} delay={delay + 14} as="rise" sound="ding">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '20px 28px',
            borderRadius: 26,
            background: colors.panel,
            border: `2px solid ${colors.border}`,
            fontSize: 34,
            fontWeight: 700,
            color: colors.text,
          }}
        >
          <span style={{ width: 16, height: 16, borderRadius: 999, background: colors.accent }} />
          {reward}
        </div>
      </Appear>
      <div style={{ display: 'grid', justifyItems: 'start', gap: 10, width: 640 }}>
        {comments.map((comment, index) => (
          <Appear
            // Comments may repeat, so their position is their identity.
            // eslint-disable-next-line react/no-array-index-key
            key={`${comment}-${index}`}
            on={on}
            delay={delay + 30 + index * 13}
            as="pop"
            style={{ marginLeft: (index % 3) * 70 }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                borderRadius: 999,
                background: colors.faint,
                border: `2px solid ${colors.border}`,
                fontSize: 28,
                fontWeight: 600,
                color: colors.text,
              }}
            >
              <Avatar name={['Ana K', 'Tom R', 'Mia L', 'Sam P', 'Lea M'][index % 5]!} size={36} />
              {comment}
            </span>
          </Appear>
        ))}
      </div>
    </div>
  );
}
