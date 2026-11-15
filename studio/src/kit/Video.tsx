import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BrandProvider, fonts, palettes, type Brand } from './theme';
import { Presenter } from './Presenter';
import { Shot, TAIL_SECONDS, TRANSITION_FRAMES, type ShotProps } from './Shot';
import { findCueTime, WordsProvider, type Word } from './timing';

/** Everything the scripts pass in: the voiceover, its word timings and the brand kit. */
export interface VideoProps {
  slug: string;
  audio?: string;
  words: Word[];
  brand: Brand;
  /** Background music under the voice (default on). */
  music?: boolean;
  [key: string]: unknown;
}

const MUSIC = 0.13;
const MUSIC_UNDER_VOICE = 0.06;

/** 0–1: how much the voice is speaking now, with soft edges, to duck the music smoothly. */
const voiceLevel = (words: Word[], seconds: number) =>
  words.reduce(
    (level, word) =>
      Math.max(
        level,
        interpolate(
          seconds,
          [word.start - 0.25, word.start, word.end, word.end + 0.45],
          [0, 1, 1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        ),
      ),
    0,
  );

function ProgressBar({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 9,
        background: 'rgba(127,127,127,0.2)',
      }}
    >
      <div
        style={{
          width: `${(frame / durationInFrames) * 100}%`,
          height: '100%',
          background: accent,
        }}
      />
    </div>
  );
}

function Handle({ handle }: { handle: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        right: 60,
        fontFamily: fonts.sans,
        fontWeight: 700,
        fontSize: 28,
        color: 'rgba(127,127,127,0.9)',
      }}
    >
      {handle}
    </div>
  );
}

/**
 * Works out when each <Shot> starts and ends: its `from` word is looked up after the
 * previous shot's start, and it lasts until the next shot starts (the last one until
 * shortly after the final word).
 */
const timeShots = (children: ReactNode, words: Word[]) => {
  const shots = Children.toArray(children).filter(
    (child): child is ReactElement<ShotProps> => isValidElement(child) && child.type === Shot,
  );
  const videoEnd = (words[words.length - 1]?.end ?? 10) + TAIL_SECONDS;
  let after = 0;
  const starts = shots.map((shot) => {
    const start = findCueTime(words, shot.props.from, after) ?? after;
    after = start + 0.01;
    return start;
  });

  return shots.map((shot, index) =>
    cloneElement(shot, {
      start: starts[index],
      end: starts[index + 1] ?? videoEnd,
      index,
      // Stay on screen while the next shot transitions in over this one.
      tail: index < shots.length - 1 ? TRANSITION_FRAMES : 0,
    }),
  );
};

/** The root of every video: voiceover, music, brand and the shots. */
export function Video({ props, children }: { props: VideoProps; children: ReactNode }) {
  const { fps } = useVideoConfig();
  const { audio, words, brand, music = true } = props;

  return (
    <BrandProvider brand={brand}>
      <WordsProvider words={words}>
        <AbsoluteFill style={{ backgroundColor: palettes[brand.tone].background }}>
          {timeShots(children, words)}
          {brand.style === 'paper' && brand.presenter !== false && <Presenter />}
          {audio && <Audio src={staticFile(audio)} />}
          {music && (
            <Audio
              src={staticFile('music/bed.wav')}
              loop
              volume={(frame) =>
                interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }) *
                (MUSIC - (MUSIC - MUSIC_UNDER_VOICE) * voiceLevel(words, frame / fps))
              }
            />
          )}
          <ProgressBar accent={brand.accent} />
          {brand.handle && <Handle handle={brand.handle} />}
        </AbsoluteFill>
      </WordsProvider>
    </BrandProvider>
  );
}
