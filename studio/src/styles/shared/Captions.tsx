import { Fragment, useMemo } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Word } from '../../kit/timing';
import { templateFonts } from './fonts';

/**
 * Burned-in captions in the look of viral shorts (after the caption styles of
 * github.com/AgriciDaniel/claude-shorts, MIT): a few words at a time, never across two
 * sentences, the spoken word in the accent colour and a little bigger, each group popping in.
 */
export const CAPTION_LOOKS = ['bold', 'game', 'clean'] as const;
export type CaptionLook = (typeof CAPTION_LOOKS)[number];

const LOOKS: Record<
  CaptionLook,
  { font: string; size: number; weight: number; maxWords: number; upper: boolean; stroke: number }
> = {
  bold: { font: templateFonts.heavy, size: 92, weight: 900, maxWords: 3, upper: true, stroke: 14 },
  game: { font: templateFonts.game, size: 104, weight: 400, maxWords: 2, upper: true, stroke: 16 },
  clean: { font: templateFonts.ui, size: 70, weight: 800, maxWords: 5, upper: false, stroke: 0 },
};

interface Page {
  start: number;
  end: number;
  words: Word[];
}

/** A pause longer than this starts a new group. */
const PAUSE = 0.35;

/**
 * Groups the spoken words into short caption pages: at most `maxWords`, and a new page after
 * every sentence and every pause, so a page never runs two sentences together.
 */
export const toPages = (words: Word[], maxWords: number): Page[] => {
  const pages: Page[] = [];
  let current: Word[] = [];
  const flush = () => {
    if (current.length > 0) {
      pages.push({
        start: current[0]!.start,
        end: current[current.length - 1]!.end,
        words: current,
      });
      current = [];
    }
  };
  words.forEach((word, index) => {
    const previous = words[index - 1];
    if (previous && word.start - previous.end > PAUSE) flush();
    current.push(word);
    if (current.length >= maxWords || /[.!?:]$/.test(word.text)) flush();
  });
  flush();
  // Each page stays until the next one starts (or a moment after its last word).
  return pages.map((page, index) => ({
    ...page,
    end: Math.min(pages[index + 1]?.start ?? page.end + 0.6, page.end + 0.6),
  }));
};

interface CaptionsProps {
  words: Word[];
  accent: string;
  look?: CaptionLook;
  /** Vertical centre of the captions, as a share of the height (0.5 is the middle). */
  y?: number;
}

export function Captions({ words, accent, look = 'bold', y = 0.62 }: CaptionsProps) {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const style = LOOKS[look];
  const pages = useMemo(() => toPages(words, style.maxWords), [words, style.maxWords]);
  const seconds = frame / fps;
  const page = pages.find((candidate) => seconds >= candidate.start && seconds < candidate.end);
  if (!page) return null;

  const pop = spring({
    frame: frame - Math.floor(page.start * fps),
    fps,
    config: { mass: 0.6, damping: 11, stiffness: 220 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: height * y,
        transform: `translateY(-50%) scale(${0.78 + pop * 0.22})`,
        fontFamily: style.font,
        fontWeight: style.weight,
        fontSize: style.size,
        lineHeight: 1.05,
        textAlign: 'center',
        letterSpacing: look === 'game' ? '0.02em' : '-0.01em',
      }}
    >
      {page.words.map((word, index) => {
        // Only the latest word that has started is the spoken one.
        const next = page.words[index + 1];
        const spoken = seconds >= word.start && (!next || seconds < next.start);
        const text = word.text;
        return (
          <Fragment key={`${word.start}-${text}`}>
            {index > 0 && ' '}
            <span
              style={{
                display: 'inline-block',
                margin: '0 0.12em',
                color: spoken ? accent : '#ffffff',
                transform: spoken ? 'scale(1.08)' : 'none',
                textTransform: style.upper ? 'uppercase' : 'none',
                WebkitTextStroke: style.stroke ? `${style.stroke}px #000` : undefined,
                paintOrder: 'stroke fill',
                textShadow:
                  look === 'clean' ? '0 4px 18px rgba(0,0,0,0.65)' : '0 8px 0 rgba(0,0,0,0.55)',
              }}
            >
              {text}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
