import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Scene, Word } from '../schema';
import { fonts, usePalette } from '../theme';

const MAX_WORDS = 4;

/** Groups words into short phrases, breaking after punctuation. */
const toPhrases = (words: Word[]) =>
  words.reduce<Word[][]>((phrases, word) => {
    const current = phrases[phrases.length - 1];
    const previous = current?.[current.length - 1];

    if (!current || current.length >= MAX_WORDS || /[.,!?;:]$/.test(previous?.text ?? '')) {
      phrases.push([word]);
    } else {
      current.push(word);
    }

    return phrases;
  }, []);

/**
 * Word-by-word captions above the platforms' bottom UI. The word being spoken
 * lights up in the accent colour. Scenes with a title already show the spoken
 * words, so captions only fill in where there is none.
 */
export function Captions({
  words,
  accent,
  scenes,
}: {
  words: Word[];
  accent: string;
  scenes: Scene[];
}) {
  const colors = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const scene = scenes.find(({ start, end }) => time >= start && time < end);
  const phrase = toPhrases(words).find(
    (candidate) =>
      time >= candidate[0]!.start && time < candidate[candidate.length - 1]!.end + 0.25,
  );

  if (!phrase || scene?.title) {
    return null;
  }

  const outline = colors.text === '#ffffff' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: 360,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 18,
        fontFamily: fonts.sans,
        fontWeight: 800,
        fontSize: 66,
        lineHeight: 1.1,
        textTransform: 'uppercase',
        letterSpacing: '-0.01em',
      }}
    >
      {phrase.map((word) => {
        const active = time >= word.start && time < word.end + 0.05;
        const pop = spring({
          frame: frame - word.start * fps,
          fps,
          config: { damping: 12, mass: 0.4 },
        });

        return (
          <span
            key={`${word.start}-${word.text}`}
            style={{
              color: active ? accent : colors.text,
              transform: `scale(${active ? 1 + 0.08 * pop : 1})`,
              WebkitTextStroke: `10px ${outline}`,
              paintOrder: 'stroke fill',
            }}
          >
            {word.text.replace(/[.,!?;:]+$/, '')}
          </span>
        );
      })}
    </div>
  );
}
