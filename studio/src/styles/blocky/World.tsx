import { useMemo } from 'react';
import { random, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { Part, plastic } from './Character';
import type { Place, TimeOfDay } from './spec';

/** Sky, light and fog per time of day. */
export const LIGHTS: Record<
  TimeOfDay,
  {
    top: string;
    horizon: string;
    sun: string;
    sunIntensity: number;
    ambient: number;
    ground: string;
  }
> = {
  day: {
    top: '#3d8fe8',
    horizon: '#cfe9ff',
    sun: '#fff6e5',
    sunIntensity: 2.6,
    ambient: 1.15,
    ground: '#8fbf6a',
  },
  sunset: {
    top: '#4b4fb8',
    horizon: '#ffb46e',
    sun: '#ffb27a',
    sunIntensity: 2.2,
    ambient: 0.85,
    ground: '#a37a5c',
  },
  night: {
    top: '#070b24',
    horizon: '#26346a',
    sun: '#9fb4ff',
    sunIntensity: 0.9,
    ambient: 0.5,
    ground: '#2b3550',
  },
};

/** A big sphere with a vertical gradient: the sky. */
export function Sky({ top, horizon }: { top: string; horizon: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color(top) },
          horizon: { value: new THREE.Color(horizon) },
        },
        vertexShader:
          'varying vec3 vPos; void main() { vPos = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0); }',
        fragmentShader:
          'uniform vec3 top; uniform vec3 horizon; varying vec3 vPos; void main() { float h = clamp(normalize(vPos).y * 1.6, 0.0, 1.0); gl_FragColor = vec4(mix(horizon, top, pow(h, 0.7)), 1.0); }',
      }),
    [top, horizon],
  );
  return (
    <mesh material={material}>
      <sphereGeometry args={[120, 32, 16]} />
    </mesh>
  );
}

const textures = new Map<string, THREE.CanvasTexture>();
/** A tiled ground texture: studded plates, wood planks, tiles, sand or asphalt. */
const groundTexture = (kind: 'studs' | 'planks' | 'tiles' | 'sand' | 'road', colour: string) => {
  const key = `${kind}|${colour}`;
  const cached = textures.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, 256, 256);
  if (kind === 'studs') {
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++) {
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.beginPath();
        ctx.arc(32 + x * 64, 30 + y * 64, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.beginPath();
        ctx.arc(32 + x * 64, 36 + y * 64, 17, 0, Math.PI);
        ctx.fill();
      }
  } else if (kind === 'planks') {
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 4;
    for (let y = 0; y <= 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((y * 1.7) % 256, y);
      ctx.lineTo((y * 1.7) % 256, y + 64);
      ctx.stroke();
    }
  } else if (kind === 'tiles') {
    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
    ctx.lineWidth = 6;
    for (let i = 0; i <= 256; i += 128) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  } else if (kind === 'sand') {
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(${random(`s${i}`) > 0.5 ? '255,255,255' : '120,90,40'},0.12)`;
      ctx.fillRect(random(`x${i}`) * 256, random(`y${i}`) * 256, 3, 3);
    }
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(120, 0, 16, 90);
    ctx.fillRect(120, 160, 16, 90);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textures.set(key, texture);
  return texture;
};

function Ground({
  kind,
  colour,
  size = 80,
  repeat = 40,
  y = 0,
}: {
  kind: 'studs' | 'planks' | 'tiles' | 'sand' | 'road';
  colour: string;
  size?: number;
  repeat?: number;
  y?: number;
}) {
  const material = useMemo(() => {
    const map = groundTexture(kind, colour).clone();
    map.needsUpdate = true;
    map.repeat.set(repeat, repeat);
    return new THREE.MeshStandardMaterial({ map, roughness: 0.85 });
  }, [kind, colour, repeat]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} material={material}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
}

function Tree({
  position,
  scale = 1,
  seed,
}: {
  position: [number, number, number];
  scale?: number;
  seed: string;
}) {
  const green = ['#3faa4a', '#4cb85a', '#2f9a48'][Math.floor(random(seed) * 3)]!;
  return (
    <group position={position} scale={scale}>
      <Part size={[0.5, 1.6, 0.5]} position={[0, 0.8, 0]} material={plastic('#7a4b2a')} />
      <Part size={[1.9, 1.3, 1.9]} position={[0, 2.1, 0]} radius={0.2} material={plastic(green)} />
      <Part size={[1.3, 0.9, 1.3]} position={[0, 3.0, 0]} radius={0.2} material={plastic(green)} />
    </group>
  );
}

function Building({
  position,
  size,
  colour,
  night,
}: {
  position: [number, number, number];
  size: [number, number, number];
  colour: string;
  night: boolean;
}) {
  const [w, h, d] = size;
  const windows = [];
  for (let y = 1.2; y < h - 0.6; y += 1.4) {
    for (let x = -w / 2 + 0.8; x < w / 2 - 0.4; x += 1.2) {
      windows.push([x, y] as const);
    }
  }
  const glass = plastic(night ? '#ffd27a' : '#bfe3ff', night ? 0.9 : 0.05);
  return (
    <group position={position}>
      <Part size={size} position={[0, h / 2, 0]} radius={0.08} material={plastic(colour)} />
      {windows.map(([x, y]) => (
        <Part
          key={`${x}${y}`}
          size={[0.6, 0.75, 0.06]}
          position={[x, y, d / 2 + 0.02]}
          material={glass}
          outline={false}
        />
      ))}
    </group>
  );
}

function Lamp({ position, on }: { position: [number, number, number]; on: boolean }) {
  return (
    <group position={position}>
      <Part size={[0.16, 3, 0.16]} position={[0, 1.5, 0]} material={plastic('#3c4250')} />
      <Part
        size={[0.6, 0.3, 0.6]}
        position={[0, 3.1, 0]}
        material={plastic('#fff1c4', on ? 1.4 : 0.1)}
      />
      {on && <pointLight position={[0, 2.8, 0]} intensity={6} distance={7} color="#ffd890" />}
    </group>
  );
}

function Water({ colour }: { colour: string }) {
  const frame = useCurrentFrame();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05 + Math.sin(frame / 20) * 0.04, -16]}>
      <planeGeometry args={[120, 24]} />
      <meshStandardMaterial
        color={colour}
        roughness={0.15}
        metalness={0.1}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

function Stars() {
  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < 600; i++) {
      const theta = random(`st${i}`) * Math.PI * 2;
      const phi = random(`sp${i}`) * Math.PI * 0.45;
      points.push(
        Math.cos(theta) * Math.sin(phi) * 100,
        Math.cos(phi) * 100,
        Math.sin(theta) * Math.sin(phi) * 100,
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return g;
  }, []);
  return (
    <points geometry={geometry}>
      <pointsMaterial color="#ffffff" size={0.6} sizeAttenuation fog={false} />
    </points>
  );
}

const BUILDING_COLOURS = [
  '#e86a5a',
  '#f2b84b',
  '#5aa9e6',
  '#9b7be0',
  '#58c49a',
  '#f08bb0',
  '#d9d4c7',
];

/** Everything that makes up a place: ground, buildings, trees and furniture. */
export function Place({ place, time }: { place: Place; time: TimeOfDay }) {
  const night = time === 'night';

  switch (place) {
    case 'park':
      return (
        <>
          <Ground kind="studs" colour={night ? '#2f5a3a' : '#5cb85c'} />
          <Ground kind="sand" colour="#d8c08e" size={3} repeat={2} y={0.01} />
          {[-9, -6, -3.5, 3.5, 6, 9, -11, 11, -7.5, 7.5].map((x, index) => (
            <Tree
              key={x}
              seed={`t${index}`}
              position={[x, 0, -6 - (index % 3) * 3]}
              scale={0.9 + random(`ts${index}`) * 0.5}
            />
          ))}
          <Part
            size={[2.6, 0.2, 0.7]}
            position={[-4.5, 0.65, -2.5]}
            material={plastic('#9a6236')}
          />
          <Part
            size={[2.6, 0.7, 0.16]}
            position={[-4.5, 1.05, -2.85]}
            material={plastic('#9a6236')}
          />
          <Lamp position={[4.6, 0, -2.6]} on={night} />
        </>
      );
    case 'city':
      return (
        <>
          <Ground kind="tiles" colour={night ? '#4b5163' : '#b9bcc4'} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -4.5]}>
            <planeGeometry args={[80, 4]} />
            <meshStandardMaterial map={groundTexture('road', '#3b3f4a')} roughness={0.9} />
          </mesh>
          {[-13, -8.5, -4, 0.5, 5, 9.5, 14].map((x, index) => (
            <Building
              key={x}
              night={night}
              position={[x, 0, -11 - (index % 2) * 2]}
              size={[4.2, 6 + random(`bh${index}`) * 8, 4]}
              colour={BUILDING_COLOURS[index % BUILDING_COLOURS.length]!}
            />
          ))}
          <Lamp position={[-5, 0, -2.3]} on={night} />
          <Lamp position={[5, 0, -2.3]} on={night} />
        </>
      );
    case 'school':
      return (
        <>
          <Ground kind="studs" colour={night ? '#2f5a3a' : '#62bd60'} />
          <Ground kind="tiles" colour="#c9c2b4" size={6} repeat={3} y={0.01} />
          <Building night={night} position={[0, 0, -10]} size={[16, 6.5, 5]} colour="#c8553d" />
          <Part size={[3, 1, 0.2]} position={[0, 5.4, -7.4]} material={plastic('#f4f1e8')} />
          <Part size={[0.15, 7, 0.15]} position={[-9.5, 3.5, -7]} material={plastic('#d9d9d9')} />
          <Part
            size={[1.6, 1, 0.06]}
            position={[-8.7, 6.4, -7]}
            material={plastic('#3a7bd5')}
            outline={false}
          />
          {[-11, 11].map((x, index) => (
            <Tree key={x} seed={`s${index}`} position={[x, 0, -6]} />
          ))}
        </>
      );
    case 'house':
      return (
        <>
          <Ground kind="planks" colour="#b9824f" size={20} repeat={6} />
          <Part
            size={[18, 8, 0.4]}
            position={[0, 4, -6]}
            material={plastic('#f2e3c6')}
            outline={false}
          />
          <Part
            size={[0.4, 8, 14]}
            position={[-8, 4, 0]}
            material={plastic('#e9d6b2')}
            outline={false}
          />
          <Part
            size={[0.4, 8, 14]}
            position={[8, 4, 0]}
            material={plastic('#e9d6b2')}
            outline={false}
          />
          <Part
            size={[3.4, 2.2, 0.1]}
            position={[4.2, 3.6, -5.75]}
            material={plastic(night ? '#1b2550' : '#a8dcff', night ? 0.2 : 0.4)}
          />
          <Part
            size={[3.6, 0.9, 1.3]}
            position={[-3.5, 0.45, -4.6]}
            material={plastic('#4f6fd1')}
          />
          <Part
            size={[3.6, 1.0, 0.35]}
            position={[-3.5, 1.3, -5.2]}
            material={plastic('#4f6fd1')}
          />
          <Part size={[2.6, 1.5, 0.12]} position={[3.3, 2.0, -5.7]} material={plastic('#121418')} />
          <Part
            size={[4, 0.02, 3]}
            position={[0, 0.02, -1]}
            material={plastic('#d6574b')}
            outline={false}
          />
          <pointLight
            position={[0, 6, 0]}
            intensity={night ? 10 : 4}
            distance={18}
            color="#ffe2b0"
          />
        </>
      );
    case 'obby':
      return (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#ff5a1f" emissive="#ff3d00" emissiveIntensity={0.7} />
          </mesh>
          <Part size={[9, 0.6, 5]} position={[0, -0.3, 0]} material={plastic('#e8e8ee')} />
          {[
            [-6, 1, -6, '#ff4d6d'],
            [-1, 2, -10, '#4dabff'],
            [5, 3, -8, '#44d17a'],
            [9, 4.5, -13, '#ffc23d'],
            [-8, 3.5, -14, '#b06bff'],
          ].map(([x, y, z, colour]) => (
            <Part
              key={`${x}${z}`}
              size={[3, 0.6, 3]}
              position={[x as number, y as number, z as number]}
              material={plastic(colour as string, 0.12)}
            />
          ))}
        </>
      );
    case 'beach':
      return (
        <>
          <Ground kind="sand" colour="#f1d79a" />
          <Water colour={night ? '#1f3d6b' : '#3fb8e8'} />
          {[-7, 7.5].map((x, index) => (
            <group key={x} position={[x, 0, -3]}>
              <Part
                size={[0.45, 4.2, 0.45]}
                position={[0, 2.1, 0]}
                rotation={[0, 0, index ? -0.12 : 0.12]}
                material={plastic('#9c6b3c')}
              />
              {[0, 1, 2, 3].map((leaf) => (
                <Part
                  key={leaf}
                  size={[2.4, 0.18, 0.7]}
                  position={[Math.cos(leaf * 1.57) * 0.9, 4.3, Math.sin(leaf * 1.57) * 0.9]}
                  rotation={[0, leaf * 1.57, -0.35]}
                  material={plastic('#2fa84f')}
                />
              ))}
            </group>
          ))}
          <Part
            size={[0.12, 2.6, 0.12]}
            position={[4.2, 1.3, -1.5]}
            material={plastic('#ffffff')}
          />
          <Part
            size={[2.6, 0.3, 2.6]}
            position={[4.2, 2.6, -1.5]}
            radius={0.12}
            material={plastic('#ff5d73')}
          />
        </>
      );
    case 'space':
      return (
        <>
          <Stars />
          <Ground kind="studs" colour="#8d93a3" />
          {[
            [-4, -3, 1.2],
            [5, -4, 0.8],
            [1, -7, 1.6],
          ].map(([x, z, r]) => (
            <mesh key={`${x}${z}`} position={[x!, 0.02, z!]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[r!, 24]} />
              <meshStandardMaterial color="#6e7384" />
            </mesh>
          ))}
          <mesh position={[-14, 16, -50]}>
            <sphereGeometry args={[7, 32, 16]} />
            <meshStandardMaterial color="#ff8a5c" emissive="#ff6a3c" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[18, 9, -40]}>
            <sphereGeometry args={[3, 32, 16]} />
            <meshStandardMaterial color="#7cc4ff" emissive="#4aa3ff" emissiveIntensity={0.25} />
          </mesh>
        </>
      );
    case 'shop':
      return (
        <>
          <Ground kind="tiles" colour="#e9ecef" size={24} repeat={8} />
          <Part
            size={[20, 8, 0.4]}
            position={[0, 4, -7]}
            material={plastic('#fdf6e3')}
            outline={false}
          />
          {[-6, 0, 6].map((x) => (
            <group key={x} position={[x, 0, -6.2]}>
              <Part size={[4.5, 4, 1]} position={[0, 2, 0]} material={plastic('#c9a27a')} />
              {[0.9, 2.1, 3.3].map((y) =>
                [-1.6, -0.6, 0.4, 1.4].map((bx, index) => (
                  <Part
                    key={`${y}${bx}`}
                    size={[0.7, 0.8, 0.5]}
                    position={[bx, y, 0.5]}
                    material={plastic(
                      BUILDING_COLOURS[(index + Math.round(y)) % BUILDING_COLOURS.length]!,
                    )}
                  />
                )),
              )}
            </group>
          ))}
          <Part size={[5, 1.2, 1.4]} position={[0, 0.6, -2.4]} material={plastic('#5a6b8c')} />
          <pointLight position={[0, 6, 0]} intensity={6} distance={18} color="#ffffff" />
        </>
      );
  }
}

export function Atmosphere({ time, place }: { time: TimeOfDay; place: Place }) {
  const light = LIGHTS[time];
  const space = place === 'space';
  const top = space ? '#030512' : light.top;
  const horizon = space ? '#141a3a' : light.horizon;
  return (
    <>
      <Sky top={top} horizon={horizon} />
      <fog attach="fog" args={[horizon, 22, place === 'house' || place === 'shop' ? 60 : 70]} />
      <hemisphereLight args={[top, light.ground, light.ambient]} />
      <directionalLight position={[6, 10, 7]} intensity={light.sunIntensity} color={light.sun} />
      <directionalLight position={[-6, 4, 8]} intensity={0.5} color={horizon} />
    </>
  );
}
