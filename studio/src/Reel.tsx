import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Background } from './components/Background';
import { Captions } from './components/Captions';
import { Handle, ProgressBar } from './components/Chrome';
import { Title } from './components/Title';
import { Visual } from './scenes/Visual';
import type { Scene as SceneSpec, Video, Word } from './schema';
import { PaletteProvider, palettes } from './theme';

/** Frames between visuals in the same scene, so they land one after another. */
const VISUAL_STAGGER = 8;
const ENTER_FRAMES = 9;
const EXIT_FRAMES = 6;

/** Scenes take turns entering differently, so cuts feel edited rather than repeated. */
const ENTRANCES = [
  (t: number) => `translateY(${(1 - t) * 90}px)`,
  (t: number) => `scale(${1.12 - t * 0.12})`,
  (t: number) => `translateX(${(1 - t) * 140}px)`,
];

interface SceneProps {
  scene: SceneSpec;
  index: number;
  accent: string;
  spoken: Word[];
  /** Keeps visuals clear of the captions. */
  captions: boolean;
}

function Scene({ scene, index, accent, spoken, captions }: SceneProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const enter = interpolate(frame, [0, ENTER_FRAMES], [0, 1], clamp);
  const exit = interpolate(
    frame,
    [durationInFrames - EXIT_FRAMES, durationInFrames],
    [1, 0],
    clamp,
  );
  // A slow push-in keeps the frame alive, like a camera.
  const drift = interpolate(frame, [0, durationInFrames], [1, 1.035]);
  const entrance = ENTRANCES[index % ENTRANCES.length]!(1 - (1 - enter) ** 3);
  // Visuals start once the title is on screen.
  const titleDelay = scene.title ? 10 : 0;

  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(enter, exit),
        transform: `${entrance} scale(${drift + (1 - exit) * 0.04})`,
        padding: `240px 70px ${captions ? 520 : 380}px`,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 90,
      }}
    >
      {scene.title && <Title title={scene.title} accent={accent} spoken={spoken} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>
        {scene.visuals.map((visual, index) => (
          <Visual
            // Visuals are static per scene, so their position is a stable key.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            spec={visual}
            accent={accent}
            delay={titleDelay + index * VISUAL_STAGGER}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}

/** Words spoken during a scene, with times relative to the scene start. */
const wordsIn = (words: Word[], { start, end }: SceneSpec) =>
  words
    .filter((word) => word.start >= start && word.start < end)
    .map((word) => ({ ...word, start: word.start - start, end: word.end - start }));

export function Reel({ audio, style, accent, handle, captions, progress, words, scenes }: Video) {
  const { fps } = useVideoConfig();

  return (
    <PaletteProvider value={palettes[style]}>
      <Background accent={accent} />
      {audio && <Audio src={staticFile(audio)} />}
      {scenes.map((scene, index) => (
        <Sequence
          key={scene.start}
          from={Math.round(scene.start * fps)}
          durationInFrames={Math.max(1, Math.round((scene.end - scene.start) * fps))}
        >
          <Scene
            scene={scene}
            index={index}
            accent={accent}
            spoken={wordsIn(words, scene)}
            captions={captions && words.length > 0 && !scene.title}
          />
        </Sequence>
      ))}
      {captions && words.length > 0 && <Captions words={words} accent={accent} scenes={scenes} />}
      {handle && <Handle handle={handle} />}
      {progress && <ProgressBar accent={accent} />}
    </PaletteProvider>
  );
}
