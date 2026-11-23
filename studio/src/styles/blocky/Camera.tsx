import { useThree } from '@react-three/fiber';
import { interpolate, useCurrentFrame } from 'remotion';
import type * as THREE from 'three';
import type { CameraMove } from './spec';

type Vec3 = [number, number, number];

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Where each camera move starts and ends, around the focus point. */
const MOVES: Record<
  CameraMove,
  (focus: Vec3, t: number) => { position: Vec3; target: Vec3; fov: number }
> = {
  wide: ([x], t) => ({
    position: [x * 0.3, 2.9 - t * 0.15, 9.6 - t * 1.0],
    target: [x * 0.3, 1.45, 0],
    fov: 46,
  }),
  close: ([x, , z], t) => ({
    position: [x + 0.3, 2.45, z + 6.4 - t * 0.7],
    target: [x, 1.95, z],
    fov: 38,
  }),
  low: ([x, , z], t) => ({
    position: [x - 0.6 + t * 1.2, 0.5, z + 6 - t * 0.5],
    target: [x, 2.1, z],
    fov: 48,
  }),
  high: ([x], t) => ({
    position: [x * 0.4, 10 - t * 0.8, 8.5],
    target: [x * 0.4, 0.6, -0.4],
    fov: 46,
  }),
  orbit: ([x], t) => {
    const angle = -0.55 + t * 1.1;
    return {
      position: [x + Math.sin(angle) * 8, 2.8, Math.cos(angle) * 8],
      target: [x, 1.5, 0],
      fov: 46,
    };
  },
  side: ([x], t) => ({
    position: [x - 1.8 + t * 3.6, 2.5, 8.4],
    target: [x - 0.6 + t * 1.2, 1.5, 0],
    fov: 44,
  }),
  over: ([x, , z], t) => ({
    position: [-x * 0.7 - Math.sign(x || 1) * 1.4, 3.0, z + 6.6 - t * 0.6],
    target: [x, 2.1, z],
    fov: 42,
  }),
};

/**
 * Glides the camera through its move over the scene, creeping in during holds (every hold
 * moves) and kicking on hard words with a shake that flips each frame and dies out over seven
 * frames, the camera language of github.com/mromidev/claude-animated-shorts (MIT).
 */
export function SceneCamera({
  move,
  focus,
  startFrame,
  endFrame,
  kicks,
}: {
  move: CameraMove;
  focus: Vec3;
  startFrame: number;
  endFrame: number;
  kicks: number[];
}) {
  const frame = useCurrentFrame();
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const t = smooth(
    interpolate(frame, [startFrame, Math.max(startFrame + 1, endFrame)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const { position, target, fov } = MOVES[move](focus, t);
  const kick = kicks.reduce((total, at) => {
    const since = frame - at;
    return since >= 0 && since < 7 ? total + (since % 2 ? -1 : 1) * 0.16 * (1 - since / 7) : total;
  }, 0);

  camera.position.set(position[0] + kick, position[1] + kick * 0.6, position[2]);
  camera.lookAt(target[0], target[1], target[2]);
  camera.rotateZ(kick * 0.12);
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
}
