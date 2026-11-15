import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { useMemo, type ReactNode } from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { BrandProvider, fonts, ToneProvider, useBrand, useColors } from './theme';
import { ShotTimingProvider, useCue, useShotTiming, useWords, WordsProvider, type Cue } from './timing';

type Vec3 = [number, number, number];

/** Vertical field of view: wide enough that a 1080×1920 frame shows a whole scene. */
const FOV = 50;

const ease = (t: number) => 1 - (1 - t) ** 3;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Moves the camera from `from` to `to` over the shot, always looking at `target`. */
function Camera({ from, to, target }: { from: Vec3; to: Vec3; target: Vec3 }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = ease(interpolate(frame, [0, durationInFrames], [0, 1], clamp));
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;

  camera.position.set(...(from.map((value, index) => value + (to[index]! - value) * t) as Vec3));
  camera.lookAt(...target);
  if (camera.fov !== FOV) {
    camera.fov = FOV;
    camera.updateProjectionMatrix();
  }

  return null;
}

/** A soft cone of light falling from above, like a stage spotlight. */
function Beam({ position, color = '#cfdcff' }: { position: Vec3; color?: string }) {
  return (
    <mesh position={position}>
      <coneGeometry args={[2.2, 9, 48, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.07}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** A dark, slightly glossy floor that catches the light. */
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <circleGeometry args={[14, 64]} />
      <meshStandardMaterial color="#0a0f1d" roughness={0.6} metalness={0.2} />
    </mesh>
  );
}

interface Stage3DProps {
  /** Camera start and end position; it glides between them over the shot. */
  camera?: { from: Vec3; to: Vec3; target?: Vec3 };
  /** Show the spotlight beam over the centre (default on). */
  beam?: boolean;
  children: ReactNode;
}

/**
 * A full-frame 3D stage for the explainer3d style: a floor, a spotlight and a slowly
 * moving camera. Pass it as a shot's `scene` and put 3D objects (Pedestal, Block, Orb,
 * Pillar, Screen, Coin, Burst) inside. 2D children of the shot float on top of it.
 */
export function Stage3D({
  camera = { from: [0, 1.6, 12], to: [0, 1.2, 10] },
  beam = true,
  children,
}: Stage3DProps) {
  const { width, height } = useVideoConfig();
  // React context does not cross into the 3D renderer: pass it in again.
  const brand = useBrand();
  const { tone, accent } = useColors();
  const words = useWords();
  const shot = useShotTiming();

  return (
    <AbsoluteFill>
      {/* offsetSize: measure without CSS transforms, so contact sheets render it whole. */}
      <ThreeCanvas width={width} height={height} resize={{ offsetSize: true }}>
        <BrandProvider brand={brand}>
          <ToneProvider tone={tone}>
            <WordsProvider words={words}>
              <ShotTimingProvider timing={shot}>
                <Camera from={camera.from} to={camera.to} target={camera.target ?? [0, 0.2, 0]} />
                <fog attach="fog" args={['#04060d', 9, 22]} />
                <ambientLight intensity={0.35} />
                <spotLight
                  position={[0, 8, 2]}
                  angle={0.5}
                  penumbra={0.8}
                  intensity={140}
                  color="#dfe7ff"
                />
                <directionalLight position={[-4, 3, 5]} intensity={0.6} color={accent} />
                {beam && <Beam position={[0, 3.3, 0]} />}
                <Floor />
                {children}
              </ShotTimingProvider>
            </WordsProvider>
          </ToneProvider>
        </BrandProvider>
      </ThreeCanvas>
    </AbsoluteFill>
  );
}

/** Entrance for a 3D object: drops in with a bounce on its cue, then floats gently. */
const useEntrance = (on: Cue | undefined, delay: number, float: boolean) => {
  const frame = useCurrentFrame();
  const cue = useCue(on, { delay, damping: 11, mass: 0.7 });
  // Without a cue it is part of the set: there from the first frame.
  const progress = on === undefined ? 1 : cue.progress;

  return {
    scale: Math.max(0.0001, progress),
    lift: (1 - progress) * 2.5 + (float ? Math.sin(frame / 22 + delay) * 0.06 : 0),
    spin: (1 - progress) * 1.2,
  };
};

interface ObjectProps {
  position?: Vec3;
  /** The word that brings it in; without it, it is there from the start. */
  on?: Cue;
  delay?: number;
  color?: string;
}

/** A round stage block to put things on. */
export function Pedestal({ position = [0, -1.05, 0], on, delay = 0, color = '#1a2238' }: ObjectProps) {
  const { scale } = useEntrance(on, delay, false);

  return (
    <mesh position={position} scale={scale}>
      <cylinderGeometry args={[1.5, 1.6, 0.3, 64]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
    </mesh>
  );
}

/** Draws text on a canvas, to use as a texture on 3D surfaces. */
const useTextTexture = (lines: string[], { color = '#ffffff', background = 'transparent', size = 120 } = {}) =>
  useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d')!;
    context.fillStyle = background;
    context.fillRect(0, 0, 1024, 1024);
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    lines.forEach((line, index) => {
      const lineSize = index === 0 ? size : size * 0.45;
      context.font = `800 ${lineSize}px ${fonts.sans}, sans-serif`;
      context.fillText(line, 512, 512 + (index - (lines.length - 1) / 2) * size * 0.95, 960);
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    return texture;
  }, [lines, color, background, size]);

/** A rounded block with a label on its front, e.g. a number, a word or an icon character. */
export function Block({
  position = [0, 0, 0],
  on,
  delay = 0,
  color,
  label,
  size = 1.1,
}: ObjectProps & { label?: string; size?: number }) {
  const { accent } = useColors();
  const { scale, lift, spin } = useEntrance(on, delay, true);
  const texture = useTextTexture(label ? [label] : [''], { size: 420 });

  return (
    <group position={[position[0], position[1] + lift, position[2]]} scale={scale} rotation={[0, spin, 0]}>
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color ?? '#2b3a63'} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0, size / 2 + 0.02, 0]}>
        <boxGeometry args={[size * 1.04, 0.06, size * 1.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
      </mesh>
      {label && (
        <mesh position={[0, 0, size / 2 + 0.005]}>
          <planeGeometry args={[size * 0.9, size * 0.9]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      )}
    </group>
  );
}

/** A glowing glass orb in the accent colour: an idea, an AI, a core. */
export function Orb({ position = [0, 0.4, 0], on, delay = 0, color, size = 0.9 }: ObjectProps & { size?: number }) {
  const { accent } = useColors();
  const { scale, lift } = useEntrance(on, delay, true);
  const tint = color ?? accent;

  return (
    <group position={[position[0], position[1] + lift, position[2]]} scale={scale}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshPhysicalMaterial
          color={tint}
          emissive={tint}
          emissiveIntensity={0.35}
          roughness={0.08}
          metalness={0.1}
          clearcoat={1}
        />
      </mesh>
      <pointLight color={tint} intensity={8} distance={6} />
    </group>
  );
}

/** A classical building with columns: a bank, the stock market, an institution. */
export function Pillar({ position = [0, -0.9, 0], on, delay = 0, color = '#e9e2d0' }: ObjectProps) {
  const { scale, lift } = useEntrance(on, delay, false);
  const columns = [-1.05, -0.35, 0.35, 1.05];
  const material = <meshStandardMaterial color={color} roughness={0.55} />;

  return (
    <group position={[position[0], position[1] + lift, position[2]]} scale={scale}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[3, 0.2, 1.6]} />
        {material}
      </mesh>
      {columns.map((x) => (
        <mesh key={x} position={[x, 0.95, 0.35]}>
          <cylinderGeometry args={[0.16, 0.18, 1.5, 32]} />
          {material}
        </mesh>
      ))}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[3, 0.22, 1.6]} />
        {material}
      </mesh>
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 1.6]}>
        <boxGeometry args={[1.1, 1.1, 1]} />
        {material}
      </mesh>
      <mesh position={[0, 0.95, -0.25]}>
        <boxGeometry args={[2.4, 1.5, 0.6]} />
        <meshStandardMaterial color="#c9b98f" emissive="#ffcf7a" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

/** A floating screen showing a big value and a caption, e.g. "$15,000" / "savings". */
export function Screen({
  position = [0, 0.5, 0],
  on,
  delay = 0,
  lines,
  tilt = -0.18,
}: ObjectProps & { lines: string[]; tilt?: number }) {
  const { accent } = useColors();
  const { scale, lift } = useEntrance(on, delay, true);
  const texture = useTextTexture(lines, { background: '#0b1122', size: 200 });

  return (
    <group position={[position[0], position[1] + lift, position[2]]} rotation={[0, tilt, 0]} scale={scale}>
      <mesh>
        <boxGeometry args={[2.6, 2.6, 0.12]} />
        <meshStandardMaterial color="#141c33" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[2.45, 2.45]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <mesh position={[0, -1.36, 0]}>
        <boxGeometry args={[2.6, 0.06, 0.14]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/** A gold coin that spins in: money, a price, a saving. */
export function Coin({ position = [0, 0.3, 0], on, delay = 0 }: ObjectProps) {
  const frame = useCurrentFrame();
  const { scale, lift } = useEntrance(on, delay, true);

  return (
    <mesh
      position={[position[0], position[1] + lift, position[2]]}
      rotation={[Math.PI / 2, 0, frame / 14 + delay]}
      scale={scale}
    >
      <cylinderGeometry args={[0.55, 0.55, 0.1, 64]} />
      <meshStandardMaterial color="#f4c24d" metalness={0.9} roughness={0.25} />
    </mesh>
  );
}

/** A cloud of small cubes that bursts out on its cue: lots of something, data, chaos. */
export function Burst({ on, count = 40, color }: { on?: Cue; count?: number; color?: string }) {
  const { accent } = useColors();
  const { progress } = useCue(on, { damping: 20 });
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        direction: [random(`bx${index}`) - 0.5, random(`by${index}`) * 0.8, random(`bz${index}`) - 0.5] as Vec3,
        size: 0.08 + random(`bs${index}`) * 0.14,
      })),
    [count],
  );

  return (
    <group>
      {pieces.map((piece, index) => (
        <mesh
          // Pieces are a fixed, generated list.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          position={piece.direction.map((value) => value * progress * 7) as Vec3}
          scale={Math.max(0.0001, progress)}
          rotation={[progress * 4 + index, progress * 3, 0]}
        >
          <boxGeometry args={[piece.size, piece.size, piece.size]} />
          <meshStandardMaterial color={color ?? accent} emissive={color ?? accent} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}
