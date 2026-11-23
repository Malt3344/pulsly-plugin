import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from './Background';
import { Headline, type HeadlineSpec } from './Headline';
import { Sfx } from './Sfx';
import { fonts, ToneProvider, useBrand, useColors, type Tone } from './theme';
import { ShotTimingProvider, useShotTiming, type Cue } from './timing';

/** The video ends this long after the last word. */
export const TAIL_SECONDS = 0.8;
/** Frames a transition takes; the next shot starts covering this one this early. */
export const TRANSITION_FRAMES = 9;

/**
 * How a shot cuts in over the previous one, full screen: `push` slides in sideways,
 * `zoom` punches in from close, `wipe` opens as a circle, `whip` flies up with blur.
 */
export const TRANSITIONS = ['push', 'zoom', 'wipe', 'whip'] as const;
export type Transition = (typeof TRANSITIONS)[number];

const ease = (t: number) => 1 - (1 - t) ** 4;

const transitionStyle = (transition: Transition, t: number) => {
  const e = ease(t);
  const blur = (1 - e) * 22;

  switch (transition) {
    case 'zoom':
      return {
        transform: `scale(${1.35 - e * 0.35})`,
        filter: `blur(${blur}px)`,
        opacity: Math.min(1, t * 2.5),
      };
    case 'wipe':
      return { clipPath: `circle(${e * 120}% at 50% 55%)` };
    case 'whip':
      return { transform: `translateY(${(1 - e) * 100}%)`, filter: `blur(${blur}px)` };
    default:
      return { transform: `translateX(${(1 - e) * 100}%)`, filter: `blur(${blur * 0.6}px)` };
  }
};

/** Content is drawn 10% larger than its pixel sizes, so visuals fill the frame like the best reels. */
const CONTENT_SCALE = 1.1;

export interface ShotProps {
  /**
   * The first word spoken in this shot (or seconds; the first shot uses 0). It is looked
   * up after the previous shot's start, and the shot lasts until the next shot starts.
   * A shot usually covers one or two sentences.
   */
  from: Cue;
  tone?: Tone;
  headline?: HeadlineSpec;
  /** A full-frame scene behind everything, e.g. a <Stage3D> in the explainer3d style. */
  scene?: ReactNode;
  /** Small chapter label at the top left, e.g. "01 · the proof". */
  chapter?: string;
  /** How this shot cuts in. Defaults rotate through all of them. */
  transition?: Transition;
  children: ReactNode;
  /** Set by <Video>. */
  start?: number;
  end?: number;
  index?: number;
  /** Frames the next shot overlaps this one while it transitions in. */
  tail?: number;
}

function ShotFrame({
  headline,
  chapter,
  transition,
  children,
  scene,
}: Pick<ShotProps, 'headline' | 'chapter' | 'children' | 'scene'> & { transition: Transition }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { lead } = useShotTiming();
  const colors = useColors();
  const { style } = useBrand();
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  // The very first shot is the thumbnail and the hook: it is there from frame 0.
  const t = lead === 0 ? 1 : interpolate(frame, [0, lead], [0, 1], clamp);
  // Content settles just after the cut, and the camera keeps pushing in slowly.
  const settle = lead === 0 ? 1 : ease(interpolate(frame, [lead * 0.5, lead * 1.6], [0, 1], clamp));
  const push = interpolate(frame, [0, durationInFrames], [1, 1.045]);

  return (
    <AbsoluteFill style={transitionStyle(transition, t)}>
      <Background />
      {scene}
      {lead > 0 && <Sfx name="whoosh" at={0} />}
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
      {headline && <Headline {...headline} />}
      <AbsoluteFill
        style={{
          top: headline && style !== 'explainer3d' ? 330 : 200,
          // Paper leaves room for the presenter, 3D for the captions.
          bottom:
            ({ paper: 600, explainer3d: 420 } as Partial<Record<typeof style, number>>)[style] ??
            360,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${push * CONTENT_SCALE * (0.95 + settle * 0.05)})`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/**
 * One shot of the video: a background, an optional headline and the visual. Words
 * inside the shot trigger animations (see `useCue`). Each shot cuts in over the
 * previous one with a full-screen transition.
 */
// `from` is resolved into `start` and `end` by <Video>, which knows the order of the shots.
export function Shot({
  from: _from,
  start = 0,
  end = start + 3,
  index = 0,
  tail = 0,
  tone,
  transition,
  ...frameProps
}: ShotProps) {
  const { fps } = useVideoConfig();
  const brand = useBrand();
  const lead = start < 0.05 ? 0 : TRANSITION_FRAMES;
  const startFrame = Math.round(start * fps) - lead;

  return (
    <Sequence
      from={Math.max(0, startFrame)}
      durationInFrames={Math.max(1, Math.round((end - start) * fps) + lead + tail)}
    >
      <ShotTimingProvider timing={{ start, end, lead }}>
        <ToneProvider tone={tone ?? brand.tone}>
          <ShotFrame
            {...frameProps}
            transition={transition ?? TRANSITIONS[index % TRANSITIONS.length]!}
          />
        </ToneProvider>
      </ShotTimingProvider>
    </Sequence>
  );
}
