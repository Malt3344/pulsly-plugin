import { useMemo } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { templateFonts } from '../shared/fonts';
import { Part, plastic } from './Character';
import type { EffectKind, PropKind } from './spec';

type Vec3 = [number, number, number];

const signTexture = (text: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff8e6';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#1b1b1f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = 120;
  do {
    ctx.font = `${size}px "${templateFonts.game}"`;
    size -= 6;
  } while (ctx.measureText(text).width > 470 && size > 30);
  ctx.fillText(text, 256, 140);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

/** A prop standing on the stage: pops in on its cue, coins and trophies spin. */
export function Prop({
  kind,
  position,
  appear,
  text = '',
}: {
  kind: PropKind;
  position: Vec3;
  /** 0 → 1 as it pops in. */
  appear: number;
  text?: string;
}) {
  const frame = useCurrentFrame();
  const spin = frame / 18;
  const sign = useMemo(() => (kind === 'sign' ? signTexture(text) : null), [kind, text]);
  const gold = plastic('#f5c518', 0.2);
  const scale = Math.max(0.0001, appear);

  const body = (() => {
    switch (kind) {
      case 'coin':
        return (
          <group
            position={[0, 1.4 + Math.sin(frame / 10) * 0.12, 0]}
            rotation={[Math.PI / 2, 0, spin]}
          >
            <mesh material={gold}>
              <cylinderGeometry args={[0.55, 0.55, 0.14, 32]} />
            </mesh>
          </group>
        );
      case 'trophy':
        return (
          <group rotation={[0, spin * 0.5, 0]}>
            <Part size={[0.9, 0.3, 0.9]} position={[0, 0.15, 0]} material={plastic('#5b3a1e')} />
            <Part size={[0.25, 0.6, 0.25]} position={[0, 0.6, 0]} material={gold} />
            <mesh position={[0, 1.3, 0]} material={gold}>
              <cylinderGeometry args={[0.6, 0.3, 0.9, 24]} />
            </mesh>
          </group>
        );
      case 'gift':
        return (
          <>
            <Part size={[1.1, 1, 1.1]} position={[0, 0.5, 0]} material={plastic('#e84a5f')} />
            <Part
              size={[1.14, 1.04, 0.2]}
              position={[0, 0.5, 0]}
              material={plastic('#ffd23f')}
              outline={false}
            />
            <Part
              size={[0.2, 1.04, 1.14]}
              position={[0, 0.5, 0]}
              material={plastic('#ffd23f')}
              outline={false}
            />
          </>
        );
      case 'phone':
        return (
          <group position={[0, 1.5, 0]} rotation={[0, 0, Math.sin(frame / 8) * 0.06]}>
            <Part size={[0.8, 1.5, 0.12]} material={plastic('#16181d')} />
            <Part
              size={[0.68, 1.3, 0.02]}
              position={[0, 0, 0.07]}
              material={plastic('#5ad1ff', 0.9)}
              outline={false}
            />
          </group>
        );
      case 'sign':
        return (
          <>
            <Part size={[0.18, 2.2, 0.18]} position={[0, 1.1, 0]} material={plastic('#8a5a35')} />
            <Part size={[2, 1.05, 0.14]} position={[0, 2.2, 0]} material={plastic('#8a5a35')} />
            <mesh position={[0, 2.2, 0.08]}>
              <planeGeometry args={[1.84, 0.92]} />
              <meshStandardMaterial map={sign} roughness={0.8} />
            </mesh>
          </>
        );
      case 'car':
        return (
          <group rotation={[0, Math.PI / 2, 0]}>
            <Part size={[3.6, 0.9, 1.7]} position={[0, 0.75, 0]} material={plastic('#e2343f')} />
            <Part size={[2, 0.8, 1.6]} position={[-0.2, 1.55, 0]} material={plastic('#e2343f')} />
            <Part
              size={[1.8, 0.6, 1.62]}
              position={[-0.2, 1.55, 0]}
              material={plastic('#aee3ff', 0.2)}
              outline={false}
            />
            {[-1.2, 1.2].flatMap((x) =>
              [-0.85, 0.85].map((z) => (
                <mesh key={`${x}${z}`} position={[x, 0.38, z]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.38, 0.38, 0.3, 20]} />
                  <meshStandardMaterial color="#1c1c20" />
                </mesh>
              )),
            )}
          </group>
        );
      case 'crate':
        return <Part size={[1.2, 1.2, 1.2]} position={[0, 0.6, 0]} material={plastic('#b07a43')} />;
      case 'cash':
        return (
          <>
            {[0, 1, 2, 3, 4].map((index) => (
              <Part
                key={index}
                size={[1.1, 0.16, 0.6]}
                position={[0, 0.08 + index * 0.17, 0]}
                rotation={[0, index * 0.15, 0]}
                material={plastic('#4cbb5a')}
              />
            ))}
          </>
        );
    }
  })();

  return (
    <group position={position} scale={scale}>
      {body}
    </group>
  );
}

const effectTextures = new Map<string, THREE.CanvasTexture>();

const burst = (
  ctx: CanvasRenderingContext2D,
  points: number,
  outer: number,
  inner: number,
  fill: string,
) => {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(256 + Math.cos(a) * r, 256 + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#141418';
  ctx.stroke();
};

const lettering = (
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  fill: string,
  y = 280,
) => {
  ctx.font = `${size}px "${templateFonts.game}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size / 6;
  ctx.strokeStyle = '#141418';
  ctx.strokeText(text, 256, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, 256, y);
};

const heartPath = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.4);
  ctx.bezierCurveTo(x - s, y - s * 0.35, x - s * 0.4, y - s, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.35, x, y + s * 0.4);
  ctx.fill();
  ctx.stroke();
};

/** A flat cartoon effect drawn once and shown as a sprite that always faces the camera. */
const effectTexture = (kind: EffectKind) => {
  const cached = effectTextures.get(kind);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#141418';
  switch (kind) {
    case 'boom':
      burst(ctx, 12, 240, 150, '#ffd23f');
      burst(ctx, 12, 170, 110, '#ff5a3c');
      lettering(ctx, 'POW!', 150, '#ffffff');
      break;
    case 'sparkles':
      [
        [180, 200, 120],
        [340, 300, 80],
        [300, 140, 55],
      ].forEach(([x, y, s]) => {
        ctx.beginPath();
        ctx.moveTo(x!, y! - s!);
        ctx.quadraticCurveTo(x!, y!, x! + s!, y!);
        ctx.quadraticCurveTo(x!, y!, x!, y! + s!);
        ctx.quadraticCurveTo(x!, y!, x! - s!, y!);
        ctx.quadraticCurveTo(x!, y!, x!, y! - s!);
        ctx.fillStyle = '#fff07a';
        ctx.fill();
        ctx.stroke();
      });
      break;
    case 'question':
      lettering(ctx, '?', 420, '#ffd23f');
      break;
    case 'exclamation':
      lettering(ctx, '!', 420, '#ff4d4d');
      break;
    case 'hearts':
      ctx.fillStyle = '#ff4d6d';
      heartPath(ctx, 200, 230, 130);
      heartPath(ctx, 350, 330, 80);
      break;
    case 'money':
      lettering(ctx, '$$$', 210, '#5ee06b');
      break;
    case 'zzz':
      lettering(ctx, 'Z', 220, '#ffffff', 330);
      lettering(ctx, 'z', 160, '#ffffff', 170);
      break;
    case 'sweat':
      ctx.beginPath();
      ctx.moveTo(256, 60);
      ctx.bezierCurveTo(390, 260, 380, 440, 256, 440);
      ctx.bezierCurveTo(132, 440, 122, 260, 256, 60);
      ctx.fillStyle = '#7cc8ff';
      ctx.fill();
      ctx.stroke();
      break;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  effectTextures.set(kind, texture);
  return texture;
};

/** Seconds an effect stays. */
export const EFFECT_SECONDS = 1.8;

export function Effect({
  kind,
  position,
  startFrame,
}: {
  kind: EffectKind;
  position: Vec3;
  startFrame: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0 || local > EFFECT_SECONDS * fps) return null;
  const pop = spring({ frame: local, fps, config: { damping: 9, mass: 0.5, stiffness: 200 } });
  const fade = Math.min(1, (EFFECT_SECONDS * fps - local) / 8);
  const size = (kind === 'boom' ? 2.2 : 1.15) * pop;
  const rise = kind === 'zzz' || kind === 'hearts' || kind === 'money' ? local / fps / 2 : 0;
  return (
    <sprite position={[position[0], position[1] + rise, position[2]]} scale={[size, size, 1]}>
      <spriteMaterial map={effectTexture(kind)} transparent opacity={fade} depthTest={false} />
    </sprite>
  );
}
