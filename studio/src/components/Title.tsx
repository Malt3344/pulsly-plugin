import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import type { Title as TitleSpec, Word } from '../schema';
import { fonts, textOn, usePalette } from '../theme';

const normalize = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

interface TitleProps {
  title: TitleSpec;
  accent: string;
  /** Spoken words during this scene, in seconds relative to the scene start. */
  spoken: Word[];
}

/**
 * Bold headline whose words pop in as they are spoken. Highlighted words sit
 * in accent pills, the signature look of the style.
 */
export function Title({ title, accent, spoken }: TitleProps) {
  const colors = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const highlights = new Set(title.highlight.map(normalize));
  const tokens = title.text.split(/\s+/).filter(Boolean);

  return (
    <h1
      style={{
        margin: 0,
        fontFamily: fonts.sans,
        fontWeight: 800,
        fontSize: 104,
        lineHeight: 1.08,
        letterSpacing: '-0.035em',
        color: colors.text,
        textAlign: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 22,
        rowGap: 14,
        textShadow: colors.titleShadow,
      }}
    >
      {tokens.map((token, index) => {
        // Reveal each word when it is spoken; fall back to a quick stagger.
        const at = spoken[index]?.start ?? index * 0.08;
        const progress = spring({
          frame: frame - at * fps,
          fps,
          config: { damping: 13, mass: 0.5 },
        });
        const isHighlight = highlights.has(normalize(token));

        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={`${token}-${index}`}
            style={{
              display: 'inline-block',
              opacity: progress,
              transform: `translateY(${(1 - progress) * 34}px) scale(${0.85 + progress * 0.15})`,
              ...(isHighlight && {
                background: accent,
                color: textOn(accent),
                borderRadius: 18,
                padding: '0 18px 6px',
                boxShadow: `0 0 50px ${accent}55`,
              }),
            }}
          >
            {token}
          </span>
        );
      })}
    </h1>
  );
}
