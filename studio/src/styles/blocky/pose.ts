import type { Action } from './spec';

export type Rot = [number, number, number];

/** How a character stands at one moment. Angles in radians; offsets in metres. */
export interface Pose {
  leftArm: Rot;
  rightArm: Rot;
  leftLeg: Rot;
  rightLeg: Rot;
  head: Rot;
  /** The whole body, turning around the feet. */
  body: Rot;
  /** Moves the whole character. */
  offset: [number, number, number];
  /** Extra turn to face where it walks (radians around y). */
  heading: number;
  /** Sitting needs a seat under it. */
  seated: boolean;
}

const still = (): Pose => ({
  leftArm: [0, 0, -0.05],
  rightArm: [0, 0, 0.05],
  leftLeg: [0, 0, 0],
  rightLeg: [0, 0, 0],
  head: [0, 0, 0],
  body: [0, 0, 0],
  offset: [0, 0, 0],
  heading: 0,
  seated: false,
});

const easeOut = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;

/** Legs and arms swinging in a walk cycle. */
const stride = (pose: Pose, t: number, speed: number, amount: number) => {
  const swing = Math.sin(t * speed) * amount;
  pose.leftLeg = [swing, 0, 0];
  pose.rightLeg = [-swing, 0, 0];
  pose.leftArm = [-swing * 0.9, 0, -0.08];
  pose.rightArm = [swing * 0.9, 0, 0.08];
  pose.offset[1] = Math.abs(Math.sin(t * speed)) * 0.06;
};

/**
 * The pose of `action`, `t` seconds after it started. `side` is -1 for characters left of
 * centre and 1 for the right, so walks and turns go the natural way.
 */
export const poseAt = (action: Action, t: number, side: number, seed: number): Pose => {
  const pose = still();
  const breathe = Math.sin(t * 2.2 + seed) * 0.015;
  pose.offset[1] = breathe;
  pose.leftArm[2] -= Math.sin(t * 1.6 + seed) * 0.03;
  pose.rightArm[2] += Math.sin(t * 1.6 + seed) * 0.03;

  switch (action) {
    case 'idle':
      pose.head = [0, Math.sin(t * 0.7 + seed) * 0.12, 0];
      break;
    case 'talk':
      pose.rightArm = [-0.7 + Math.sin(t * 4.5) * 0.25, 0, 0.25 + Math.sin(t * 3) * 0.1];
      pose.leftArm = [-0.25 + Math.sin(t * 3.7 + 1) * 0.15, 0, -0.15];
      pose.head = [Math.sin(t * 7) * 0.05, Math.sin(t * 1.3) * 0.15, Math.sin(t * 2.1) * 0.04];
      break;
    case 'wave':
      pose.rightArm = [0, 0, 2.6 + Math.sin(t * 11) * 0.35];
      pose.head = [0, 0, Math.sin(t * 2) * 0.08];
      break;
    case 'point':
      pose.rightArm = [-1.55, 0, -0.15 * side];
      pose.body = [0, -0.2 * side, 0];
      break;
    case 'walk':
      stride(pose, t, 8, 0.65);
      pose.heading = (side <= 0 ? 1 : -1) * (Math.PI / 2);
      pose.offset[0] = (side <= 0 ? 1 : -1) * (t * 1.4 - 1.2);
      break;
    case 'run':
      stride(pose, t, 14, 1.05);
      pose.body = [0.22, 0, 0];
      pose.heading = (side <= 0 ? 1 : -1) * (Math.PI / 2);
      pose.offset[0] = (side <= 0 ? 1 : -1) * (t * 3.4 - 2.4);
      break;
    case 'enter': {
      const walking = t < 1.3;
      const from = (side <= 0 ? -1 : 1) * 5.5;
      pose.offset[0] = from * (1 - easeOut(t / 1.3));
      if (walking) {
        stride(pose, t, 9, 0.7);
        pose.heading = (side <= 0 ? 1 : -1) * (Math.PI / 2) * (1 - easeOut((t - 1.0) / 0.3));
      }
      break;
    }
    case 'exit': {
      const away = side <= 0 ? -1 : 1;
      pose.heading = away * (Math.PI / 2) * easeOut(t / 0.25);
      if (t > 0.2) {
        stride(pose, t, 9, 0.7);
        pose.offset[0] = away * (t - 0.2) * 2.6;
      }
      break;
    }
    case 'jump': {
      const hop = Math.abs(Math.sin(t * Math.PI * 1.7));
      pose.offset[1] = hop * 0.95;
      pose.leftArm = [0, 0, -2.2 * hop - 0.2];
      pose.rightArm = [0, 0, 2.2 * hop + 0.2];
      pose.leftLeg = [-0.5 * hop, 0, 0];
      pose.rightLeg = [-0.3 * hop, 0, 0];
      break;
    }
    case 'dance': {
      const beat = t * 5.2;
      pose.body = [0, Math.sin(beat / 2) * 0.55, Math.sin(beat) * 0.08];
      pose.leftArm = [0, 0, -1.4 - Math.sin(beat) * 1.1];
      pose.rightArm = [0, 0, 1.4 - Math.sin(beat) * 1.1];
      pose.leftLeg = [Math.max(0, Math.sin(beat)) * -0.6, 0, 0];
      pose.rightLeg = [Math.max(0, -Math.sin(beat)) * -0.6, 0, 0];
      pose.offset[1] = Math.abs(Math.sin(beat)) * 0.18;
      pose.head = [0, 0, Math.sin(beat) * 0.12];
      break;
    }
    case 'sit':
      pose.seated = true;
      pose.leftLeg = [-1.5, 0, 0.05];
      pose.rightLeg = [-1.5, 0, -0.05];
      pose.offset[1] = -0.5;
      pose.leftArm = [-0.6, 0, -0.1];
      pose.rightArm = [-0.6 + Math.sin(t * 2) * 0.05, 0, 0.1];
      break;
    case 'fall': {
      const down = easeOut(t / 0.45);
      pose.body = [-1.45 * down, 0, 0.15 * down * side];
      pose.leftArm = [0, 0, -1.4 * down];
      pose.rightArm = [0, 0, 1.4 * down];
      pose.offset[1] =
        0.25 * down +
        (t < 0.45 ? 0 : Math.max(0, Math.sin((t - 0.45) * 12)) * 0.08 * Math.exp(-(t - 0.45) * 5));
      break;
    }
    case 'celebrate': {
      const hop = Math.abs(Math.sin(t * Math.PI * 2.2));
      pose.offset[1] = hop * 0.45;
      pose.leftArm = [0, 0, -2.75 + Math.sin(t * 14) * 0.15];
      pose.rightArm = [0, 0, 2.75 - Math.sin(t * 14) * 0.15];
      pose.head = [-0.15, 0, Math.sin(t * 7) * 0.1];
      break;
    }
    case 'cry':
      // Head down, arms limp, shoulders shaking: the tears stay visible.
      pose.head = [0.22, 0, Math.sin(t * 9) * 0.04];
      pose.leftArm = [-0.2, 0, -0.05 + Math.sin(t * 16) * 0.05];
      pose.rightArm = [-0.2, 0, 0.05 - Math.sin(t * 16) * 0.05];
      pose.offset[1] += Math.abs(Math.sin(t * 9)) * 0.03;
      break;
    case 'think':
      pose.rightArm = [-1.85, 0, -0.4];
      pose.leftArm = [-0.5, 0, 0.35];
      pose.head = [-0.12, 0.15 * Math.sin(t * 0.8), 0.14];
      break;
    case 'shrug': {
      const up = Math.abs(Math.sin(t * 2.4));
      pose.leftArm = [-0.3, 0, -0.9 * up - 0.2];
      pose.rightArm = [-0.3, 0, 0.9 * up + 0.2];
      pose.head = [0, 0, 0.18 * up];
      break;
    }
    case 'scared':
      pose.offset[0] = Math.sin(t * 60) * 0.025;
      pose.leftArm = [-1.9, 0, 0.3];
      pose.rightArm = [-1.9, 0, -0.3];
      pose.body = [-0.12, 0, 0];
      break;
  }

  return pose;
};
