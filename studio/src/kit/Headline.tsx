import type { CSSProperties } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { normalize, useShotTiming, useWords } from './timing';
import { fonts, useColors } from './theme';

export interface HeadlineSpec {
  /** What the voice says during the shot, shortened. Words appear as they are spoken. */
  text: string;
  /** Words to box in the accent colour, written exactly as in `text`. */
  highlight?: string[];
}

type Layout = 'centered' | 'paper' | 'captions';

/** Where the headline sits and how highlighted words look, per tone. */
const LAYOUT: Record<Layout, CSSProperties> = {
  centered: { top: 150, justifyContent: 'center', textAlign: 'center', fontSize: 62 },
  paper: { top: 165, justifyContent: 'flex-start', textAlign: 'left', fontSize: 66 },
  captions: { bottom: 250, justifyContent: 'center', textAlign: 'center', fontSize: 60 },
};

const highlightStyle = (layout: Layout, accent: string, glow: number): CSSProperties => {
  if (layout === 'paper') {
    return { fontFamily: fonts.serif, fontWeight: 400, fontSize: '1.14em', color: accent };
  }

  return {
    padding: '0 12px 4px',
    borderRadius: 12,
    border: `3px solid ${accent}`,
    background: `${accent}26`,
    boxShadow: `0 0 ${24 * glow}px ${accent}55`,
  };
};

/**
 * Headline that types itself along with the voice: small at the top in the motion style,
 * left-aligned with serif accents on paper, and as captions at the bottom in 3D space,
 * where the word being spoken is boxed. The visual is the star; this anchors the words.
 */
export function Headline({ text, highlight = [] }: HeadlineSpec) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = useColors();
  const shot = useShotTiming();
  const spoken = useWords().filter(
    (word) => word.start >= shot.start - 0.05 && word.start < shot.end,
  );
  const boxed = new Set(highlight.map(normalize));
  const tokens = text.split(/\s+/).filter(Boolean);
  const layout: Layout =
    colors.tone === 'paper' ? 'paper' : colors.tone === 'space' ? 'captions' : 'centered';
  const now = frame / fps - shot.lead / fps + shot.start;

  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        right: 80,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        columnGap: 14,
        rowGap: 10,
        fontFamily: fonts.sans,
        fontWeight: layout === 'paper' ? 600 : 700,
        lineHeight: 1.12,
        letterSpacing: '-0.025em',
        color: colors.text,
        textShadow: layout === 'captions' ? '0 4px 24px rgba(0,0,0,0.8)' : undefined,
        ...LAYOUT[layout],
      }}
    >
      {tokens.map((token, index) => {
        // Reveal each word as it is spoken; fall back to a quick stagger.
        const at = (spoken[index]?.start ?? shot.start + index * 0.12) - shot.start;
        const progress = spring({
          frame: frame - shot.lead - at * fps,
          fps,
          config: { damping: 16, mass: 0.4 },
        });
        const word = spoken[index];
        // In captions, the word being spoken right now is boxed; otherwise the highlights.
        const isBoxed =
          layout === 'captions'
            ? Boolean(word && now >= word.start && now < word.end + 0.08)
            : boxed.has(normalize(token));

        return (
          <span
            // Tokens are positional: the same word may appear twice.
            // eslint-disable-next-line react/no-array-index-key
            key={`${token}-${index}`}
            style={{
              display: 'inline-block',
              opacity: progress,
              transform: `translateY(${(1 - progress) * 18}px)`,
              ...(layout === 'captions' && boxed.has(normalize(token)) && { color: colors.accent }),
              ...(isBoxed && highlightStyle(layout, colors.accent, progress)),
            }}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
}
