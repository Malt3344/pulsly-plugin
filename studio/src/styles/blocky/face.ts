import * as THREE from 'three';
import type { Face } from './spec';

const SIZE = 256;
const INK = '#1b1b1f';
const cache = new Map<string, THREE.CanvasTexture>();

const eye = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
};

const brows = (ctx: CanvasRenderingContext2D, tilt: number) => {
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(62, 62 - tilt);
  ctx.lineTo(112, 62 + tilt);
  ctx.moveTo(144, 62 + tilt);
  ctx.lineTo(194, 62 - tilt);
  ctx.stroke();
};

const heart = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.35, y - s, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.35, y - s, x + s, y - s * 0.4, x, y + s * 0.35);
  ctx.fill();
};

/**
 * The face of a blocky head: toy-like features on a transparent texture. Cached per look, so
 * every frame reuses the same textures.
 */
export const faceTexture = (face: Face, mouthOpen: boolean, blink: boolean) => {
  const key = `${face}|${mouthOpen}|${blink}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  // Only the features: the face sits on a transparent plate in front of the head.
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';

  // Eyes.
  const closed = blink || face === 'sleepy';
  if (face === 'cool') {
    ctx.fillRect(48, 82, 160, 18);
    ctx.beginPath();
    ctx.roundRect(52, 88, 66, 44, 14);
    ctx.roundRect(138, 88, 66, 44, 14);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(64, 96, 16, 8);
    ctx.fillRect(150, 96, 16, 8);
    ctx.fillStyle = INK;
  } else if (face === 'love') {
    ctx.fillStyle = '#ef3b55';
    heart(ctx, 88, 104, 34);
    heart(ctx, 168, 104, 34);
    ctx.fillStyle = INK;
  } else if (closed) {
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(70, 104);
    ctx.quadraticCurveTo(88, 114, 106, 104);
    ctx.moveTo(150, 104);
    ctx.quadraticCurveTo(168, 114, 186, 104);
    ctx.stroke();
  } else if (face === 'shocked') {
    ctx.fillStyle = '#ffffff';
    eye(ctx, 88, 102, 52, 60);
    eye(ctx, 168, 102, 52, 60);
    ctx.fillStyle = INK;
    eye(ctx, 88, 104, 22, 26);
    eye(ctx, 168, 104, 22, 26);
  } else {
    eye(ctx, 88, 104, 24, 42);
    eye(ctx, 168, 104, 24, 42);
    ctx.fillStyle = '#ffffff';
    eye(ctx, 92, 94, 8, 10);
    eye(ctx, 172, 94, 8, 10);
    ctx.fillStyle = INK;
  }

  // Eyebrows.
  if (face === 'angry') brows(ctx, 14);
  if (face === 'sad' || face === 'cry') brows(ctx, -12);
  if (face === 'smirk') {
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(144, 58);
    ctx.lineTo(194, 50);
    ctx.stroke();
  }

  // Mouth.
  ctx.lineWidth = 12;
  ctx.beginPath();
  if (mouthOpen && face !== 'cool' && face !== 'sleepy') {
    ctx.fillStyle = '#5a1d24';
    ctx.moveTo(84, 160);
    ctx.quadraticCurveTo(128, 222, 172, 160);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
  } else if (face === 'happy' || face === 'love') {
    ctx.moveTo(80, 160);
    ctx.quadraticCurveTo(128, 208, 176, 160);
    ctx.stroke();
  } else if (face === 'sad' || face === 'cry') {
    ctx.moveTo(90, 192);
    ctx.quadraticCurveTo(128, 158, 166, 192);
    ctx.stroke();
  } else if (face === 'angry') {
    ctx.moveTo(92, 184);
    ctx.lineTo(164, 178);
    ctx.stroke();
  } else if (face === 'shocked') {
    eye(ctx, 128, 182, 40, 48);
  } else if (face === 'smirk' || face === 'cool') {
    ctx.moveTo(100, 176);
    ctx.quadraticCurveTo(150, 190, 174, 160);
    ctx.stroke();
  } else if (face === 'sleepy') {
    eye(ctx, 128, 180, 18, 22);
  } else {
    ctx.moveTo(100, 176);
    ctx.lineTo(156, 176);
    ctx.stroke();
  }

  if (face === 'cry') {
    ctx.fillStyle = 'rgba(80,170,255,0.9)';
    ctx.fillRect(74, 126, 22, 110);
    ctx.fillRect(160, 126, 22, 110);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);

  return texture;
};

export const SKINS: Record<string, string> = {
  yellow: '#f6d046',
  light: '#f3d2b6',
  tan: '#d9a77c',
  brown: '#a66e45',
  dark: '#6b4428',
};

export const skinColour = (skin = 'yellow') => SKINS[skin] ?? skin;
