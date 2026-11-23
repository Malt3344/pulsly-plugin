import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sfx } from '../../kit/Sfx';
import { useBrand } from '../../kit/theme';
import type { Word } from '../../kit/timing';
import type { VideoProps } from '../../kit/Video';
import { templateFonts } from '../shared/fonts';
import { TemplateFrame } from '../shared/Frame';
import { cueAfter, timeScenes } from '../shared/scenes';
import { SceneCamera } from './Camera';
import { Character } from './Character';
import { poseAt } from './pose';
import type { BlockySceneSpec, BlockyStorySpec, CharacterLook, Slot } from './spec';
import { Effect, Prop } from './Things';
import { Atmosphere, Place } from './World';

type Vec3 = [number, number, number];

const SLOT_POSITIONS: Record<Slot, Vec3> = {
  left: [-1.35, 0, 0],
  center: [0, 0, 0],
  right: [1.35, 0, 0],
  'back-left': [-1, 0, -2.4],
  'back-right': [1, 0, -2.4],
};

/** Screen x (share of the width) of each slot, for speech bubbles. */
const SLOT_SCREEN_X: Record<Slot, number> = {
  left: 0.3,
  center: 0.5,
  right: 0.7,
  'back-left': 0.38,
  'back-right': 0.62,
};

const sideOf = (slot: Slot) => Math.sign(SLOT_POSITIONS[slot][0]);

const UNKNOWN: CharacterLook = { shirt: '#888888', pants: '#444444' };

type TimedScene = BlockySceneSpec & { start: number; end: number };

const isSpeaking = (words: Word[], seconds: number) =>
  words.some((word) => seconds >= word.start && seconds < word.end);

/** Everything in one scene's 3D world, at the current frame. */
function SceneWorld({
  scene,
  cast,
  words,
}: {
  scene: TimedScene;
  cast: BlockyStorySpec['cast'];
  words: Word[];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const time = scene.time ?? 'day';
  const move = scene.camera ?? 'wide';
  const focusActor = scene.actors.find((actor) => actor.id === scene.focus) ?? scene.actors[0];
  // Moves about one character aim at it; the others take in the whole stage.
  const aimed = move === 'close' || move === 'low' || move === 'over';
  const focus = aimed && focusActor ? SLOT_POSITIONS[focusActor.at] : SLOT_POSITIONS.center;
  const speaking = isSpeaking(words, seconds);
  const kicks = (scene.shake ?? []).map((cue) =>
    Math.round(cueAfter(words, cue, scene.start, -10) * fps),
  );

  return (
    <>
      <SceneCamera
        move={move}
        focus={focus}
        startFrame={Math.round(scene.start * fps)}
        endFrame={Math.round(scene.end * fps)}
        kicks={kicks}
      />
      <Atmosphere time={time} place={scene.place} />
      <Place place={scene.place} time={time} />

      {scene.actors.map((actor, index) => {
        const look = cast[actor.id] ?? UNKNOWN;
        const startsAt = cueAfter(words, actor.on, scene.start, scene.start);
        const started = seconds >= startsAt;
        const action = started ? (actor.action ?? 'idle') : 'idle';
        const side = sideOf(actor.at);
        const seed = index * 1.7 + actor.id.length;
        const pose = poseAt(action, seconds - (started ? startsAt : scene.start), side, seed);
        const bubbleNow = (scene.bubbles ?? []).some((bubble) => {
          const at = cueAfter(words, bubble.on, scene.start, -1);
          return bubble.by === actor.id && seconds >= at && seconds < at + 2.2;
        });
        const talking = (action === 'talk' || bubbleNow) && speaking && frame % 6 < 3;
        const blink = (frame + index * 37) % 83 < 3;
        const face = started ? (actor.face ?? (action === 'cry' ? 'cry' : 'happy')) : 'happy';

        return (
          <Character
            key={actor.id}
            look={look}
            pose={pose}
            face={face}
            mouthOpen={talking}
            blink={blink}
            position={SLOT_POSITIONS[actor.at]}
            facing={-side * 0.38}
          />
        );
      })}

      {(scene.props ?? []).map((prop, index) => {
        const at = cueAfter(words, prop.on, scene.start, -1);
        const appear =
          prop.on === undefined
            ? 1
            : spring({
                frame: frame - Math.round(at * fps),
                fps,
                config: { damping: 10, mass: 0.6 },
              });
        const [x, y, z] = SLOT_POSITIONS[prop.at];
        const taken = scene.actors.some((actor) => actor.at === prop.at);
        return (
          <Prop
            key={`${prop.kind}${index}`}
            kind={prop.kind}
            text={prop.text}
            appear={appear}
            position={
              taken
                ? [x + (x === 0 ? 1.1 : -Math.sign(x) * 0.9), y, z + 0.9]
                : [x * 0.8, y, z - 0.6]
            }
          />
        );
      })}

      {(scene.effects ?? []).map((effect, index) => {
        const actor = scene.actors.find((candidate) => candidate.id === effect.over);
        const slot = actor?.at ?? (effect.over as Slot);
        const [x, , z] = SLOT_POSITIONS[slot] ?? SLOT_POSITIONS.center;
        const at = cueAfter(words, effect.on, scene.start, scene.start);
        return (
          <Effect
            key={`${effect.kind}${index}`}
            kind={effect.kind}
            position={[x + 0.75, 3.05, z + 0.2]}
            startFrame={Math.round(at * fps)}
          />
        );
      })}
    </>
  );
}

function Bubble({
  name,
  text,
  x,
  accent,
  startFrame,
}: {
  name?: string;
  text: string;
  x: number;
  accent: string;
  startFrame: number;
}) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pop = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 200 },
  });
  const left = Math.min(Math.max(x * width, 300), width - 300);

  return (
    <div
      style={{
        position: 'absolute',
        top: height * 0.13,
        left,
        transform: `translateX(-50%) scale(${pop})`,
        transformOrigin: 'bottom center',
        maxWidth: 760,
        background: '#ffffff',
        border: '7px solid #141418',
        borderRadius: 44,
        padding: '26px 38px',
        boxShadow: '0 12px 0 rgba(0,0,0,0.25)',
        fontFamily: templateFonts.ui,
        fontWeight: 900,
        fontSize: 54,
        lineHeight: 1.12,
        color: '#141418',
        textAlign: 'center',
      }}
    >
      {name && (
        <div
          style={{
            fontSize: 32,
            color: accent,
            marginBottom: 6,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {name}
        </div>
      )}
      {text}
      <div
        style={{
          position: 'absolute',
          bottom: -38,
          left: '50%',
          marginLeft: -22,
          width: 0,
          height: 0,
          borderLeft: '22px solid transparent',
          borderRight: '22px solid transparent',
          borderTop: '38px solid #141418',
        }}
      />
    </div>
  );
}

/** One scene: the 3D world, its speech bubbles and the cut into it. */
function SceneView({
  scene,
  cast,
  words,
}: {
  scene: TimedScene;
  cast: BlockyStorySpec['cast'];
  words: Word[];
}) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { accent } = useBrand();
  const startFrame = Math.round(scene.start * fps);
  const since = frame - startFrame;
  // Each cut lands with a small punch-in.
  const punch = interpolate(since, [0, 7], [1.07, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const flash = scene.flash
    ? interpolate(since, [0, 5], [0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  const seconds = frame / fps;
  const bubbles = (scene.bubbles ?? []).map((bubble) => ({
    ...bubble,
    at: cueAfter(words, bubble.on, scene.start, scene.start),
  }));
  const bubble = [...bubbles]
    .reverse()
    .find((candidate) => seconds >= candidate.at && seconds < candidate.at + 2.6);
  const speaker = bubble && scene.actors.find((actor) => actor.id === bubble.by);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <ThreeCanvas width={width} height={height} resize={{ offsetSize: true }}>
          <SceneWorld scene={scene} cast={cast} words={words} />
        </ThreeCanvas>
      </AbsoluteFill>
      {bubble && (
        <Bubble
          key={`${bubble.at}`}
          name={cast[bubble.by]?.name}
          text={bubble.text}
          x={speaker ? SLOT_SCREEN_X[speaker.at] : 0.5}
          accent={accent}
          startFrame={Math.round(bubble.at * fps)}
        />
      )}
      {flash > 0 && <AbsoluteFill style={{ background: '#ffffff', opacity: flash }} />}
    </AbsoluteFill>
  );
}

/** Sound effects on the beats: a whoosh on every cut, pops and hits on effects and props. */
function SceneSounds({ scenes, words }: { scenes: TimedScene[]; words: Word[] }) {
  const { fps } = useVideoConfig();
  return (
    <>
      {scenes.flatMap((scene, index) => [
        ...(index > 0
          ? [<Sfx key={`cut${index}`} name="whoosh" at={Math.round(scene.start * fps) - 3} />]
          : []),
        ...(scene.effects ?? []).map((effect, effectIndex) => (
          <Sfx
            key={`fx${index}-${effectIndex}`}
            name={
              effect.kind === 'boom'
                ? 'stamp'
                : effect.kind === 'money' || effect.kind === 'sparkles'
                  ? 'ding'
                  : 'pop'
            }
            at={Math.round(cueAfter(words, effect.on, scene.start, scene.start) * fps)}
          />
        )),
        ...(scene.props ?? [])
          .filter((prop) => prop.on !== undefined)
          .map((prop, propIndex) => (
            <Sfx
              key={`prop${index}-${propIndex}`}
              name="pop"
              at={Math.round(cueAfter(words, prop.on, scene.start, scene.start) * fps)}
            />
          )),
        ...(scene.bubbles ?? []).map((bubble, bubbleIndex) => (
          <Sfx
            key={`bubble${index}-${bubbleIndex}`}
            name="click"
            at={Math.round(cueAfter(words, bubble.on, scene.start, scene.start) * fps)}
          />
        )),
      ])}
    </>
  );
}

/**
 * The `blocky` style: a story acted out by blocky toy characters in bright 3D game worlds,
 * with big game captions. Fill it from a typed spec: who is in it (`cast`) and what happens
 * in every scene; the template does the animation, camera, timing and sound.
 */
export function BlockyStory({ props, story }: { props: VideoProps; story: BlockyStorySpec }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scenes = timeScenes(story.scenes, props.words);
  const current =
    [...scenes].reverse().find((scene) => frame >= Math.round(scene.start * fps)) ?? scenes[0];

  return (
    <TemplateFrame props={props} background="#87c6ff" captions={{ look: 'game', y: 0.76 }}>
      {current && (
        <SceneView
          key={scenes.indexOf(current)}
          scene={current}
          cast={story.cast}
          words={props.words}
        />
      )}
      <SceneSounds scenes={scenes} words={props.words} />
    </TemplateFrame>
  );
}
