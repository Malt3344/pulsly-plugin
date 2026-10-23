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
import { Title } from './components/Title';
import { Visual } from './scenes/Visual';
import type { Scene as SceneSpec, Video, Word } from './schema';

/** Frames between visuals in the same scene, so they land one after another. */
const VISUAL_STAGGER = 8;
const FADE_FRAMES = 6;

interface SceneProps {
  scene: SceneSpec;
  accent: string;
  spoken: Word[];
}

function Scene({ scene, accent, spoken }: SceneProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = interpolate(
    frame,
    [0, FADE_FRAMES, durationInFrames - FADE_FRAMES, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  // Visuals start once the title is on screen.
  const titleDelay = scene.title ? 10 : 0;

  return (
    <AbsoluteFill
      style={{
        opacity: fade,
        transform: `scale(${0.98 + fade * 0.02})`,
        padding: '260px 70px 380px',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: scene.title ? 'flex-start' : 'center',
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

export function Reel({ audio, accent, words, scenes }: Video) {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background accent={accent} />
      {audio && <Audio src={staticFile(audio)} />}
      {scenes.map((scene) => (
        <Sequence
          key={scene.start}
          from={Math.round(scene.start * fps)}
          durationInFrames={Math.max(1, Math.round((scene.end - scene.start) * fps))}
        >
          <Scene scene={scene} accent={accent} spoken={wordsIn(words, scene)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
