import { popIn, useEntrance } from '../components/animation';
import type { Visual } from '../schema';
import { colors, fonts } from '../theme';

type StickerSpec = Extract<Visual, { type: 'sticker' }>;

/** "HELLO my name is" name tag that slaps onto the screen. */
export function Sticker({
  spec,
  accent,
  delay,
}: {
  spec: StickerSpec;
  accent: string;
  delay: number;
}) {
  const progress = useEntrance(delay, 10);
  const pop = popIn(progress, 80);

  return (
    <div
      style={{
        ...pop,
        transform: `${pop.transform} rotate(${-14 + progress * 8}deg)`,
        width: 760,
        borderRadius: 32,
        overflow: 'hidden',
        background: '#f4f4f0',
        boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
        fontFamily: fonts.sans,
      }}
    >
      <div
        style={{
          background: accent,
          padding: '26px 0 18px',
          textAlign: 'center',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em' }}>
          {spec.top}
        </div>
        <div style={{ fontSize: 46, fontWeight: 700, color: colors.ink }}>{spec.subtitle}</div>
      </div>
      <div
        style={{
          padding: '46px 30px 54px',
          textAlign: 'center',
          fontSize: 76,
          fontWeight: 800,
          color: '#111111',
          letterSpacing: '-0.03em',
        }}
      >
        {spec.name}
      </div>
    </div>
  );
}
