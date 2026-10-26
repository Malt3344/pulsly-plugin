import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from './Background';
import { Headline, type HeadlineSpec } from './Headline';
import { Sfx } from './Sfx';
import { fonts, ToneProvider, useBrand, useColors, type Tone } from './theme';
import { ShotTimingProvider, type Cue } from './timing';

/** The video ends this long after the last word. */
export const TAIL_SECONDS = 0.8;

const ENTER = 10;
const EXIT = 6;

/** Each shot enters differently from the last, so cuts feel edited, not repeated. */
export const ENTRANCES = ['rise', 'zoom', 'slide', 'drop'] as const;
export type Entrance = (typeof ENTRANCES)[number];

const enterTransform = (entrance: Entrance, t: number) => {
  const ease = 1 - (1 - t) ** 3;
  switch (entrance) {
    case 'zoom':
      return `scale(${1.18 - ease * 0.18})`;
    case 'slide':
      return `translateX(${(1 - ease) * 260}px)`;
    case 'drop':
      return `translateY(${(1 - ease) * -200}px)`;
    default:
      return `translateY(${(1 - ease) * 160}px)`;
  }
};

export interface ShotProps {
  /**
   * The first word spoken in this shot (or seconds; the first shot uses 0). It is looked
   * up after the previous shot's start, and the shot lasts until the next shot starts.
   * A shot usually covers one or two sentences.
   */
  from: Cue;
  /** Set by <Video>: the resolved start and end in seconds. */
  start?: number;
  end?: number;
  tone?: Tone;
  headline?: HeadlineSpec;
  /** Small chapter label at the top left, e.g. "01 · the proof". */
  chapter?: string;
  entrance?: Entrance;
  /** Plays a whoosh as the shot comes in (default true). */
  whoosh?: boolean;
  children: ReactNode;
}

/** Content is drawn 10% larger than its pixel sizes, so visuals fill the frame like the best reels. */
const CONTENT_SCALE = 1.1;

function ShotFrame({
  headline,
  chapter,
  entrance = 'rise',
  whoosh = true,
  first,
  children,
}: Omit<ShotProps, 'from' | 'start' | 'end' | 'tone'> & { first: boolean }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const colors = useColors();
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  // The very first frame is the thumbnail and the hook: it must not fade in.
  const enter = first ? 1 : interpolate(frame, [0, ENTER], [0, 1], clamp);
  const exit = interpolate(frame, [durationInFrames - EXIT, durationInFrames], [1, 0], clamp);
  // A slow push-in keeps the frame alive, like a camera on a slider.
  const push = interpolate(frame, [0, durationInFrames], [1, 1.04]);

  return (
    <AbsoluteFill>
      <Background />
      {whoosh && !first && <Sfx name="whoosh" at={0} />}
      {chapter && (
        <div
          style={{
            position: 'absolute',
            top: 92,
            left: 80,
            fontFamily: fonts.mono,
            fontSize: 24,
            color: colors.muted,
            letterSpacing: '0.04em',
          }}
        >
          // {chapter}
        </div>
      )}
      <AbsoluteFill style={{ opacity: Math.min(enter, exit) }}>
        {headline && <Headline {...headline} />}
        <AbsoluteFill
          style={{
            top: headline ? 330 : 200,
            bottom: 360,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `${enterTransform(entrance, enter)} scale(${(push + (1 - exit) * 0.05) * CONTENT_SCALE})`,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/**
 * One shot of the video: a background, an optional headline and the visual. Words
 * inside the shot can trigger animations (see `useCue`).
 */
// `from` is resolved into `start` and `end` by <Video>, which knows the order of the shots.
export function Shot({ from: _from, start = 0, end = start + 3, tone, ...frameProps }: ShotProps) {
  const { fps } = useVideoConfig();
  const brand = useBrand();

  return (
    <Sequence
      from={Math.round(start * fps)}
      durationInFrames={Math.max(1, Math.round((end - start) * fps))}
    >
      <ShotTimingProvider timing={{ start, end }}>
        <ToneProvider tone={tone ?? brand.tone}>
          <ShotFrame {...frameProps} first={start < 0.1} />
        </ToneProvider>
      </ShotTimingProvider>
    </Sequence>
  );
}
