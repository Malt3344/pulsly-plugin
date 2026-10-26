import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { normalize, useShotTiming, useWords } from './timing';
import { fonts, useColors } from './theme';

export interface HeadlineSpec {
  /** What the voice says during the shot, shortened. Words appear as they are spoken. */
  text: string;
  /** Words to box in the accent colour, written exactly as in `text`. */
  highlight?: string[];
}

/**
 * Small headline at the top that types itself along with the voice. The visual
 * below is the star; the headline just anchors what is being said.
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

  return (
    <div
      style={{
        position: 'absolute',
        top: 150,
        left: 80,
        right: 80,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 14,
        rowGap: 10,
        fontFamily: fonts.sans,
        fontSize: 62,
        fontWeight: 700,
        lineHeight: 1.12,
        letterSpacing: '-0.025em',
        color: colors.text,
        textAlign: 'center',
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
        const isBoxed = boxed.has(normalize(token));

        return (
          <span
            // Tokens are positional: the same word may appear twice.
            // eslint-disable-next-line react/no-array-index-key
            key={`${token}-${index}`}
            style={{
              display: 'inline-block',
              opacity: progress,
              transform: `translateY(${(1 - progress) * 18}px)`,
              ...(isBoxed && {
                padding: '0 12px 4px',
                borderRadius: 12,
                border: `3px solid ${colors.accent}`,
                background: `${colors.accent}26`,
                boxShadow: `0 0 ${24 * progress}px ${colors.accent}55`,
              }),
            }}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
}
