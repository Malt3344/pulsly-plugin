import { popIn, useEntrance } from '../components/animation';
import type { Visual } from '../schema';
import { fonts, textOn } from '../theme';

type NotificationsSpec = Extract<Visual, { type: 'notifications' }>;

const INTERVAL = 10;

function Notification({
  item,
  accent,
  delay,
}: {
  item: NotificationsSpec['items'][number];
  accent: string;
  delay: number;
}) {
  const progress = useEntrance(delay, 12);

  return (
    <div
      style={{
        ...popIn(progress, -60),
        display: 'flex',
        gap: 22,
        alignItems: 'center',
        padding: '24px 28px',
        borderRadius: 34,
        background: 'rgba(245,245,247,0.92)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        color: '#111111',
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 76,
          height: 76,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: accent,
          color: textOn(accent),
          fontSize: 40,
          fontWeight: 800,
        }}
      >
        {item.app.charAt(0).toUpperCase()}
      </span>
      <span style={{ flex: 1, display: 'grid', gap: 4 }}>
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 28,
            color: '#6b6b6b',
          }}
        >
          <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {item.app}
          </span>
          <span>{item.time}</span>
        </span>
        <span style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.2 }}>{item.text}</span>
      </span>
    </div>
  );
}

/** Lock-screen notifications that stack in one after another, newest on top. */
export function Notifications({
  spec,
  accent,
  delay,
}: {
  spec: NotificationsSpec;
  accent: string;
  delay: number;
}) {
  return (
    <div style={{ width: 900, display: 'grid', gap: 18, fontFamily: fonts.sans }}>
      {spec.items.map((item, index) => (
        <Notification
          key={`${item.app}-${item.text}`}
          item={item}
          accent={accent}
          delay={delay + index * INTERVAL}
        />
      ))}
    </div>
  );
}
