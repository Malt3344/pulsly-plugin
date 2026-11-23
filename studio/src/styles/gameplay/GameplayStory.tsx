import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { BadgeCheckIcon, HeartIcon, MessageCircleIcon, Share2Icon } from 'lucide-react';
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import * as THREE from 'three';
import { textOn } from '../../kit/theme';
import type { VideoProps } from '../../kit/Video';
import { Character, Part, plastic } from '../blocky/Character';
import { poseAt } from '../blocky/pose';
import type { CharacterLook } from '../blocky/spec';
import { Sky } from '../blocky/World';
import { templateFonts } from '../shared/fonts';
import { TemplateFrame } from '../shared/Frame';

export const COURSES = ['lava', 'sky', 'neon'] as const;
export type Course = (typeof COURSES)[number];

export interface GameplayStorySpec {
  /** The story's title, shown on a card for the first seconds (the hook). */
  title: string;
  /** Who tells it, on the card. Default: the brand's handle or name. */
  author?: string;
  /** The runner's look. */
  runner?: CharacterLook;
  course?: Course;
}

const SPEED = 7.5;
const PLATFORM = 9;
const GAP = 2.4;
const PERIOD = PLATFORM + GAP;
const JUMP_FROM = PLATFORM - 1.3;
const JUMP_LENGTH = GAP + 2.6;

const THEMES: Record<
  Course,
  { sky: string; fog: string; below: string; belowGlow: number; colours: string[]; light: number }
> = {
  lava: {
    sky: '#3d8fe8',
    fog: '#ffc58f',
    below: '#ff4a12',
    belowGlow: 1,
    colours: ['#ff4d6d', '#4dabff', '#44d17a', '#ffc23d', '#b06bff'],
    light: 2.4,
  },
  sky: {
    sky: '#5fb8ff',
    fog: '#e8f6ff',
    below: '#ffffff',
    belowGlow: 0.35,
    colours: ['#7dd3fc', '#f9a8d4', '#fde68a', '#a7f3d0', '#c4b5fd'],
    light: 2.6,
  },
  neon: {
    sky: '#0a0620',
    fog: '#1a0b3d',
    below: '#120632',
    belowGlow: 0.2,
    colours: ['#ff2bd6', '#22e4ff', '#a3ff3d', '#ffe53d', '#8b5cff'],
    light: 1.2,
  },
};

/** How high the runner is `distance` metres into the course: a jump over every gap. */
export const jumpHeight = (distance: number) => {
  const phase = distance % PERIOD;
  const into = (phase - JUMP_FROM + PERIOD) % PERIOD;
  if (into > JUMP_LENGTH) return 0;
  const t = into / JUMP_LENGTH;
  return 4 * t * (1 - t) * 1.6;
};

function FollowCamera({ distance }: { distance: number }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 45) * 0.6;
  // High and behind: the runner sits in the lower third, under the captions.
  camera.position.set(1.1 + sway * 0.6, 6.4, -distance + 9.5);
  camera.lookAt(0, 2.4, -distance - 12);
  if (camera.fov !== 55) {
    camera.fov = 55;
    camera.updateProjectionMatrix();
  }
  return null;
}

const lavaTextures = new Map<string, THREE.CanvasTexture>();
/** Glowing blobs on the ground below the course: lava, clouds or a neon grid. */
const belowTexture = (course: Course) => {
  const cached = lavaTextures.get(course);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  if (course === 'neon') {
    ctx.fillStyle = '#0d0426';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#ff2bd6';
    ctx.lineWidth = 6;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  } else {
    const lava = course === 'lava';
    ctx.fillStyle = lava ? '#b3200b' : '#dff1ff';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 70; i++) {
      const x = random(`lx${i}`) * 512;
      const y = random(`ly${i}`) * 512;
      const r = 20 + random(`lr${i}`) * 60;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, lava ? '#ffe066' : '#ffffff');
      glow.addColorStop(0.5, lava ? '#ff7b1c' : '#f4faff');
      glow.addColorStop(1, lava ? 'rgba(255,80,20,0)' : 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  lavaTextures.set(course, texture);
  return texture;
};

function Course({
  distance,
  theme,
  course,
}: {
  distance: number;
  theme: (typeof THEMES)[Course];
  course: Course;
}) {
  const frame = useCurrentFrame();
  const first = Math.floor(distance / PERIOD) - 1;
  const platforms = Array.from({ length: 9 }, (_, index) => first + index).filter((n) => n >= 0);

  return (
    <>
      {platforms.map((n) => {
        const z = -(n * PERIOD + PLATFORM / 2);
        const colour = theme.colours[n % theme.colours.length]!;
        const coinsTaken = (k: number) => distance > n * PERIOD + 2 + k * 2.2;
        return (
          <group key={n}>
            <Part
              size={[3.2, 0.7, PLATFORM]}
              position={[0, -0.35, z]}
              radius={0.12}
              material={plastic(colour, 0.12)}
            />
            {/* Coins to collect along each platform. */}
            {[0, 1, 2].map((k) =>
              coinsTaken(k) ? null : (
                <mesh
                  key={k}
                  position={[0, 1.3, -(n * PERIOD + 2 + k * 2.2)]}
                  rotation={[Math.PI / 2, 0, distance + k]}
                  material={plastic('#f5c518', 0.35)}
                >
                  <cylinderGeometry args={[0.35, 0.35, 0.1, 24]} />
                </mesh>
              ),
            )}
            {/* Floating blocks beside the course. */}
            <Part
              size={[1.4, 1.4, 1.4]}
              position={[n % 2 ? -5 : 5.5, 1 + (n % 3), z - 2]}
              rotation={[0.4, n, 0.2]}
              material={plastic(theme.colours[(n + 2) % theme.colours.length]!, 0.2)}
            />
            {n % 4 === 0 && (
              <group position={[1.3, 0, z + PLATFORM / 2 - 0.6]}>
                <Part
                  size={[0.12, 2.4, 0.12]}
                  position={[0, 1.2, 0]}
                  material={plastic('#e5e7eb')}
                />
                <Part
                  size={[0.9, 0.55, 0.06]}
                  position={[0.45, 2.1, 0]}
                  material={plastic('#22c55e', 0.3)}
                  outline={false}
                />
              </group>
            )}
          </group>
        );
      })}
      {/* Fixed in the world, so the ground streams past as the runner moves. */}
      <mesh
        rotation={[-Math.PI / 2, 0, frame / 900]}
        position={[0, -5, -Math.floor(distance / 100) * 100 - 60]}
      >
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial
          map={belowTexture(course)}
          emissive={theme.below}
          emissiveIntensity={theme.belowGlow * 0.35}
        />
      </mesh>
    </>
  );
}

function Runner({
  look,
  distance,
  seconds,
}: {
  look: CharacterLook;
  distance: number;
  seconds: number;
}) {
  const pose = poseAt('run', seconds, 0, 0);
  const height = jumpHeight(distance);
  const airborne = height > 0.05;
  pose.offset = [0, height, 0];
  pose.heading = 0;
  if (airborne) {
    pose.leftArm = [0, 0, -2.4];
    pose.rightArm = [0, 0, 2.4];
    pose.leftLeg = [-0.9, 0, 0];
    pose.rightLeg = [0.3, 0, 0];
  }
  return (
    <Character
      look={look}
      pose={pose}
      face="happy"
      mouthOpen={false}
      blink={false}
      position={[0, 0, -distance]}
      facing={Math.PI}
    />
  );
}

function TitleCard({ title, author, accent }: { title: string; author: string; accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // On screen from the very first frame: it is the thumbnail.
  const enter = 1 - (1 - spring({ frame, fps, config: { damping: 13, mass: 0.6 } })) * 0.15;
  const leave = interpolate(frame, [3.4 * fps, 3.8 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (leave >= 1) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 210,
        left: 70,
        right: 70,
        transform: `translateY(${(1 - enter) * -60 - leave * 140}px) scale(${0.9 + enter * 0.1 - leave * 0.1})`,
        opacity: enter * (1 - leave),
        background: '#ffffff',
        borderRadius: 40,
        padding: '40px 46px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        fontFamily: templateFonts.ui,
        color: '#111318',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 26 }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            background: accent,
            color: textOn(accent),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 42,
          }}
        >
          {author.replace(/^@/, '').slice(0, 1).toUpperCase()}
        </div>
        <div
          style={{ fontWeight: 900, fontSize: 38, display: 'flex', alignItems: 'center', gap: 10 }}
        >
          {author}
          <BadgeCheckIcon size={36} color="#ffffff" fill="#1d9bf0" />
        </div>
      </div>
      <div style={{ fontWeight: 900, fontSize: 58, lineHeight: 1.15 }}>{title}</div>
      <div
        style={{
          display: 'flex',
          gap: 46,
          marginTop: 30,
          color: '#6b7280',
          fontWeight: 800,
          fontSize: 32,
        }}
      >
        {[
          [HeartIcon, '99+'],
          [MessageCircleIcon, '99+'],
          [Share2Icon, 'Share'],
        ].map(([Icon, label]) => {
          const IconComponent = Icon as typeof HeartIcon;
          return (
            <span key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconComponent size={34} /> {label as string}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const DEFAULT_RUNNER: CharacterLook = {
  shirt: '#3b82f6',
  pants: '#1f2a44',
  hair: 'cap',
  hairColor: '#e11d48',
};

/**
 * The `gameplay` style: the story is told over a never-ending 3D parkour run, with big
 * captions in the middle and the title on a card for the first seconds. Only text: the
 * template does the rest.
 */
export function GameplayStory({ props, story }: { props: VideoProps; story: GameplayStorySpec }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const theme = THEMES[story.course ?? 'lava'];
  const seconds = frame / fps;
  const distance = seconds * SPEED;

  return (
    <TemplateFrame props={props} background={theme.sky} captions={{ look: 'bold', y: 0.4 }}>
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} resize={{ offsetSize: true }}>
          <Sky top={theme.sky} horizon={theme.fog} />
          <fog attach="fog" args={[theme.fog, 25, 85]} />
          <hemisphereLight args={[theme.sky, theme.below, 1.1]} />
          <directionalLight position={[5, 10, 6]} intensity={theme.light} />
          <FollowCamera distance={distance} />
          <Course distance={distance} theme={theme} course={story.course ?? 'lava'} />
          <Runner look={story.runner ?? DEFAULT_RUNNER} distance={distance} seconds={seconds} />
        </ThreeCanvas>
      </AbsoluteFill>
      <TitleCard
        title={story.title}
        author={story.author ?? props.brand.handle ?? 'Story time'}
        accent={props.brand.accent}
      />
    </TemplateFrame>
  );
}
