import { createContext, useContext, type ReactNode } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** A spoken word with its time in seconds, from words.json. */
export interface Word {
  text: string;
  start: number;
  end: number;
}

interface ShotTiming {
  /** Seconds into the video where the shot starts and ends. */
  start: number;
  end: number;
  /** Frames the shot begins before `start`, while it transitions in over the previous one. */
  lead: number;
}

const WordsContext = createContext<Word[]>([]);
const ShotContext = createContext<ShotTiming>({ start: 0, end: Infinity, lead: 0 });

export function WordsProvider({ words, children }: { words: Word[]; children: ReactNode }) {
  return <WordsContext.Provider value={words}>{children}</WordsContext.Provider>;
}

export function ShotTimingProvider({
  timing,
  children,
}: {
  timing: ShotTiming;
  children: ReactNode;
}) {
  return <ShotContext.Provider value={timing}>{children}</ShotContext.Provider>;
}

export const useWords = () => useContext(WordsContext);
export const useShotTiming = () => useContext(ShotContext);

export const normalize = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/**
 * When something should happen: a spoken word (the first time it is said in this
 * shot, or the nth time), or seconds from the start of the video.
 */
export type Cue = string | number | { word: string; nth?: number };

/**
 * Seconds into the video when a cue is spoken, searching from `after` onwards.
 * Returns undefined for words that are not found.
 */
export const findCueTime = (
  words: Word[],
  cue: Cue,
  after = 0,
  before = Infinity,
): number | undefined => {
  if (typeof cue === 'number') return cue;

  const { word, nth = 1 } = typeof cue === 'string' ? { word: cue } : cue;
  const target = normalize(word);
  const matches = words.filter(
    (candidate) =>
      normalize(candidate.text) === target &&
      candidate.start >= after - 0.05 &&
      candidate.start < before,
  );

  return matches[nth - 1]?.start;
};

/** Seconds into the video for a cue. Unknown words fall back to the shot start. */
export const useCueTime = (cue: Cue | undefined): number => {
  const words = useWords();
  const shot = useShotTiming();

  if (cue === undefined) return shot.start;
  if (typeof cue === 'number') return cue;

  const { word, nth = 1 } = typeof cue === 'string' ? { word: cue } : cue;
  const target = normalize(word);
  const matches = words.filter(
    (candidate) =>
      normalize(candidate.text) === target &&
      candidate.start >= shot.start - 0.05 &&
      candidate.start < shot.end,
  );

  return matches[nth - 1]?.start ?? shot.start;
};

/**
 * Animation progress for a cue: `frame` is frames since the cue (negative before it),
 * `progress` springs from 0 to 1 once the cue has been spoken.
 */
export const useCue = (cue: Cue | undefined, { delay = 0, damping = 14, mass = 0.6 } = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shot = useShotTiming();
  const cueTime = useCueTime(cue);
  // Anything cued on the shot's first word comes in with the transition, so a shot never
  // cuts in empty.
  const startFrame =
    (cueTime <= shot.start + 0.02 ? 0 : Math.round((cueTime - shot.start) * fps) + shot.lead) +
    delay;
  const since = frame - startFrame;

  return {
    since,
    startFrame,
    progress: spring({ frame: since, fps, config: { damping, mass } }),
    started: since >= 0,
  };
};
