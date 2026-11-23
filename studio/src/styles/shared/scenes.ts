import { TAIL_SECONDS } from '../../kit/Shot';
import { findCueTime, type Cue, type Word } from '../../kit/timing';

export interface Timed {
  /** Seconds into the video. */
  start: number;
  end: number;
}

/**
 * When each scene plays: its `from` cue is looked up after the previous scene's start, and it
 * lasts until the next one starts (the last one until shortly after the final word). The first
 * scene always starts at 0, so the first frame is never empty.
 */
export const timeScenes = <T extends { from?: Cue }>(scenes: T[], words: Word[]) => {
  const videoEnd = (words[words.length - 1]?.end ?? 10) + TAIL_SECONDS;
  let after = 0;
  const starts = scenes.map((scene, index) => {
    if (index === 0) return 0;
    const start =
      (scene.from === undefined ? undefined : findCueTime(words, scene.from, after)) ?? after;
    after = start + 0.01;
    return start;
  });

  return scenes.map((scene, index) => ({
    ...scene,
    start: starts[index]!,
    end: starts[index + 1] ?? videoEnd,
  }));
};

const firstWord = (text: string) => text.trim().split(/\s+/)[0] ?? '';
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/**
 * When each of a list of on-screen texts is said: an explicit cue wins; otherwise the text's
 * first word. Each search starts after the previous text's last word, so a word that also
 * appears inside the previous text is never matched there. Texts the voice does not say fall
 * back to just after the previous one.
 */
export const timeTexts = <T extends { text: string; on?: Cue }>(items: T[], words: Word[]) => {
  let after = 0;

  return items.map((item) => {
    const at = findCueTime(words, item.on ?? firstWord(item.text), after) ?? after + 0.6;
    // Skip past this text's own words before looking for the next one.
    const startIndex = words.findIndex((word) => word.start >= at - 0.05);
    const nextWord = startIndex < 0 ? undefined : words[startIndex + wordCount(item.text)];
    after = nextWord ? nextWord.start : at + 0.01;
    return { ...item, at };
  });
};

/** Seconds of the cue, searched from `after`, or `fallback` when the word is not said. */
export const cueAfter = (words: Word[], cue: Cue | undefined, after: number, fallback: number) =>
  cue === undefined ? fallback : (findCueTime(words, cue, after) ?? fallback);

/**
 * When each word of an on-screen `text` is said: the spoken words from `at` onwards, one per
 * word of the text. Lets text appear or light up word by word with the voice.
 */
export const wordTimes = (text: string, words: Word[], at: number) => {
  const first = words.findIndex((word) => word.start >= at - 0.05);
  const count = text.trim().split(/\s+/).length;
  return Array.from({ length: count }, (_, index) => {
    const word = first < 0 ? undefined : words[first + index];
    return word?.start ?? at + index * 0.3;
  });
};
