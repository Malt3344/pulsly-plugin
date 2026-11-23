import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { faceTexture, skinColour } from './face';
import type { Pose } from './pose';
import type { CharacterLook, Face } from './spec';

const OUTLINE = new THREE.MeshBasicMaterial({
  color: '#141418',
  side: THREE.BackSide,
  // Pushed back in depth, so the outline never shows through the block's own edges.
  polygonOffset: true,
  polygonOffsetFactor: 2,
  polygonOffsetUnits: 4,
});
const OUTLINE_WIDTH = 0.05;

const geometries = new Map<string, THREE.BufferGeometry>();
const rounded = (w: number, h: number, d: number, r: number) => {
  const key = `${w}|${h}|${d}|${r}`;
  let geometry = geometries.get(key);
  if (!geometry) {
    geometry = new RoundedBoxGeometry(w, h, d, 3, r);
    geometries.set(key, geometry);
  }
  return geometry;
};

const materials = new Map<string, THREE.MeshStandardMaterial>();
/** Smooth toy plastic. */
export const plastic = (color: string, emissive = 0) => {
  const key = `${color}|${emissive}`;
  let material = materials.get(key);
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      metalness: 0.02,
      emissive: emissive ? color : '#000000',
      emissiveIntensity: emissive,
    });
    materials.set(key, material);
  }
  return material;
};

interface PartProps {
  size: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  material: THREE.Material | THREE.Material[];
  radius?: number;
  outline?: boolean;
}

/** A rounded block with a cartoon ink outline (an inverted hull drawn just behind it). */
export function Part({
  size,
  position,
  rotation,
  material,
  radius = 0.06,
  outline = true,
}: PartProps) {
  const [w, h, d] = size;
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={rounded(w, h, d, radius)} material={material} />
      {outline && (
        <mesh
          geometry={rounded(w + OUTLINE_WIDTH, h + OUTLINE_WIDTH, d + OUTLINE_WIDTH, radius + 0.02)}
          material={OUTLINE}
        />
      )}
    </group>
  );
}

function HairPiece({ hair, color }: { hair: CharacterLook['hair']; color: string }) {
  const material = plastic(color);
  switch (hair) {
    case 'short':
      return (
        <>
          <Part size={[0.7, 0.16, 0.7]} position={[0, 0.34, 0]} material={material} />
          <Part
            size={[0.7, 0.34, 0.12]}
            position={[0, 0.16, -0.3]}
            material={material}
            outline={false}
          />
        </>
      );
    case 'long':
      return (
        <>
          <Part size={[0.7, 0.16, 0.7]} position={[0, 0.34, 0]} material={material} />
          <Part size={[0.72, 0.8, 0.14]} position={[0, -0.04, -0.3]} material={material} />
          <Part
            size={[0.1, 0.62, 0.5]}
            position={[0.33, 0.04, -0.06]}
            material={material}
            outline={false}
          />
          <Part
            size={[0.1, 0.62, 0.5]}
            position={[-0.33, 0.04, -0.06]}
            material={material}
            outline={false}
          />
        </>
      );
    case 'spiky':
      return (
        <>
          <Part size={[0.68, 0.14, 0.68]} position={[0, 0.33, 0]} material={material} />
          {[-0.22, 0, 0.22].map((x, index) => (
            <Part
              key={x}
              size={[0.2, 0.3, 0.2]}
              position={[x, 0.48, index === 1 ? 0.05 : -0.08]}
              rotation={[0.3, 0, x * 1.6]}
              material={material}
            />
          ))}
        </>
      );
    case 'cap':
      return (
        <>
          <Part size={[0.72, 0.22, 0.72]} position={[0, 0.36, 0]} material={material} />
          <Part size={[0.6, 0.06, 0.34]} position={[0, 0.27, 0.46]} material={material} />
        </>
      );
    case 'beanie':
      return (
        <Part size={[0.74, 0.36, 0.74]} position={[0, 0.36, 0]} radius={0.16} material={material} />
      );
    case 'crown':
      return (
        <>
          <Part
            size={[0.6, 0.14, 0.6]}
            position={[0, 0.38, 0]}
            material={plastic('#f5c518', 0.15)}
          />
          {[
            [-0.24, -0.24],
            [0.24, -0.24],
            [-0.24, 0.24],
            [0.24, 0.24],
          ].map(([x, z]) => (
            <Part
              key={`${x}${z}`}
              size={[0.12, 0.18, 0.12]}
              position={[x!, 0.52, z!]}
              material={plastic('#f5c518', 0.15)}
            />
          ))}
        </>
      );
    default:
      return null;
  }
}

interface CharacterProps {
  look: CharacterLook;
  pose: Pose;
  face: Face;
  mouthOpen: boolean;
  blink: boolean;
  position: [number, number, number];
  /** Turn around y, towards the camera or the other character. */
  facing: number;
}

/** A blocky toy figure: head, body, two arms and two legs, posed from `pose`. */
export function Character({
  look,
  pose,
  face,
  mouthOpen,
  blink,
  position,
  facing,
}: CharacterProps) {
  const skin = skinColour(look.skin);
  const skinMaterial = plastic(skin);
  const faceMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: faceTexture(face, mouthOpen, blink),
        transparent: true,
        roughness: 0.5,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    [face, mouthOpen, blink],
  );
  const shirt = plastic(look.shirt);
  const pants = plastic(look.pants);
  const [x, y, z] = position;

  return (
    <group
      position={[x + pose.offset[0], y + pose.offset[1], z + pose.offset[2]]}
      rotation={[0, facing + pose.heading, 0]}
    >
      {/* Soft contact shadow on the ground. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012 - pose.offset[1], 0]}>
        <circleGeometry args={[0.72, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <group rotation={pose.body}>
        {/* Legs hang from the hips. */}
        <group position={[-0.25, 1, 0]} rotation={pose.leftLeg}>
          <Part size={[0.48, 1, 0.5]} position={[0, -0.5, 0]} material={pants} />
        </group>
        <group position={[0.25, 1, 0]} rotation={pose.rightLeg}>
          <Part size={[0.48, 1, 0.5]} position={[0, -0.5, 0]} material={pants} />
        </group>
        <Part size={[1, 1, 0.5]} position={[0, 1.5, 0]} material={shirt} />
        {/* Arms hang from the shoulders. */}
        <group position={[-0.75, 1.92, 0]} rotation={pose.leftArm}>
          <Part size={[0.46, 0.68, 0.46]} position={[0, -0.32, 0]} material={shirt} />
          <Part size={[0.44, 0.34, 0.44]} position={[0, -0.82, 0]} material={skinMaterial} />
        </group>
        <group position={[0.75, 1.92, 0]} rotation={pose.rightArm}>
          <Part size={[0.46, 0.68, 0.46]} position={[0, -0.32, 0]} material={shirt} />
          <Part size={[0.44, 0.34, 0.44]} position={[0, -0.82, 0]} material={skinMaterial} />
        </group>
        <group position={[0, 2.34, 0]} rotation={pose.head}>
          <Part size={[0.64, 0.64, 0.64]} radius={0.1} material={skinMaterial} />
          <mesh position={[0, 0, 0.322]} material={faceMaterial}>
            <planeGeometry args={[0.6, 0.6]} />
          </mesh>
          <HairPiece hair={look.hair} color={look.hairColor ?? '#3a2a1e'} />
        </group>
      </group>
      {pose.seated && (
        <Part size={[1.3, 0.5, 1.1]} position={[0, -0.25, -0.1]} material={plastic('#8a5a35')} />
      )}
    </group>
  );
}
