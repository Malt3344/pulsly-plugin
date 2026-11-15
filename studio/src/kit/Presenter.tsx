import { interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrand } from './theme';
import { useWords, type Word } from './timing';

/** How the presenter looks. Set it in brand.json as "presenter". */
export interface PresenterLook {
  skin: string;
  hair: string;
  /** Defaults to the brand accent. */
  shirt?: string;
}

const DEFAULT_LOOK: PresenterLook = { skin: '#f0c4a1', hair: '#2a1c15' };

/**
 * Gestures: the direction of the upper arm and the forearm in degrees (0 = right,
 * 90 = up), for the left arm then the right arm as seen by the viewer.
 */
const POSES = [
  { left: [255, 35], right: [285, 145] }, // both hands open in front
  { left: [258, 75], right: [35, 85] }, // right hand raised towards the visual
  { left: [232, 165], right: [308, 15] }, // shrug, palms up
  { left: [262, 100], right: [282, 160] }, // one hand explaining
] as const;

const SENTENCE_END = /[.!?]$/;
const MOUTH_SPEED = 13;
const BLINK_EVERY_S = 3.1;

/** Indexes of the words that start a sentence, so gestures change with the speech. */
const sentenceStarts = (words: Word[]) =>
  words.flatMap((word, index) =>
    index === 0 || SENTENCE_END.test(words[index - 1]!.text) ? [word.start] : [],
  );

/** The colour a little darker, so sleeves stand out against the body. */
const shade = (hex: string, amount = 0.18) =>
  `#${[1, 3, 5]
    .map((index) =>
      Math.round(parseInt(hex.slice(index, index + 2), 16) * (1 - amount))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

function Arm({
  x,
  angles,
  color,
  skin,
}: {
  x: number;
  angles: readonly [number, number];
  color: string;
  skin: string;
}) {
  const [upperAngle, forearmAngle] = angles;
  const upper = 92;
  const lower = 84;
  const a = (upperAngle * Math.PI) / 180;
  const b = (forearmAngle * Math.PI) / 180;
  const ex = x + Math.cos(a) * upper;
  const ey = 420 + Math.sin(a) * upper * -1;
  const hx = ex + Math.cos(b) * lower;
  const hy = ey + Math.sin(b) * lower * -1;

  return (
    <g>
      <path
        d={`M ${x} 420 L ${ex} ${ey} L ${hx} ${hy}`}
        stroke={color}
        strokeWidth={44}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx={hx} cy={hy} r={25} fill={skin} />
      <circle cx={hx - 4} cy={hy - 6} r={9} fill="rgba(255,255,255,0.18)" />
    </g>
  );
}

/**
 * A friendly cartoon presenter for the paper style. It talks along with the voice,
 * blinks, and changes gesture at every new sentence. Rendered by <Video>.
 */
export function Presenter() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = useWords();
  const brand = useBrand();
  const look = { ...DEFAULT_LOOK, ...(brand.presenter || {}) };
  const shirt = look.shirt ?? brand.accent;
  const now = frame / fps;

  const speaking = words.find((word) => now >= word.start && now < word.end);
  const mouth = speaking ? 0.3 + 0.7 * Math.abs(Math.sin((now - speaking.start) * MOUTH_SPEED)) : 0;

  const starts = sentenceStarts(words);
  const sentence = Math.max(0, starts.filter((start) => start <= now).length - 1);
  const since = now - (starts[sentence] ?? 0);
  const blend =
    sentence === 0 ? 1 : interpolate(since, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
  const from = POSES[Math.max(0, sentence - 1) % POSES.length]!;
  const to = POSES[sentence % POSES.length]!;
  const pose = (side: 'left' | 'right') =>
    [lerp(from[side][0], to[side][0], blend), lerp(from[side][1], to[side][1], blend)] as const;
  const browLift = interpolate(since, [0, 0.15, 0.6], [0, 9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const blinkPeriod = BLINK_EVERY_S + random(`blink-${Math.floor(now / BLINK_EVERY_S)}`) * 1.2;
  const blinking = now % blinkPeriod < 0.12;
  const bob = Math.sin(frame / 16) * 4 + (speaking ? Math.sin(frame / 3) * 1.5 : 0);

  return (
    <svg
      viewBox="0 0 400 560"
      style={{
        position: 'absolute',
        right: 10,
        bottom: -10,
        width: 470,
        height: 658,
        transform: `translateY(${bob}px)`,
        filter: 'drop-shadow(0 18px 30px rgba(60,45,30,0.18))',
      }}
    >
      {/* Body */}
      <path d="M 70 560 C 70 440 110 395 200 392 C 290 395 330 440 330 560 Z" fill={shirt} />
      <path d="M 165 392 Q 200 430 235 392" stroke="rgba(0,0,0,0.16)" strokeWidth={8} fill="none" />
      <rect x={180} y={340} width={40} height={58} rx={16} fill={look.skin} />
      <Arm x={120} angles={pose('left')} color={shade(shirt)} skin={look.skin} />
      <Arm x={280} angles={pose('right')} color={shade(shirt)} skin={look.skin} />

      {/* Head */}
      <circle cx={108} cy={236} r={20} fill={look.skin} />
      <circle cx={292} cy={236} r={20} fill={look.skin} />
      <ellipse cx={200} cy={228} rx={92} ry={106} fill={look.skin} />
      <path
        d="M 106 214 C 96 118 160 92 214 100 C 276 108 312 150 296 218 C 286 176 262 150 226 146 C 196 168 150 170 118 164 C 110 180 108 196 106 214 Z"
        fill={look.hair}
      />

      {/* Brows */}
      <rect x={140} y={186 - browLift} width={40} height={10} rx={5} fill={look.hair} />
      <rect x={222} y={186 - browLift} width={40} height={10} rx={5} fill={look.hair} />

      {/* Eyes, looking a little towards the visual */}
      {[160, 242].map((x) => (
        <g key={x} transform={`translate(${x} 222) scale(1 ${blinking ? 0.1 : 1})`}>
          <ellipse rx={15} ry={17} fill="#ffffff" />
          <circle cx={-4} cy={1} r={9} fill="#1d1612" />
          <circle cx={-7} cy={-3} r={3} fill="#ffffff" />
        </g>
      ))}

      {/* Cheeks and nose */}
      <ellipse cx={142} cy={266} rx={16} ry={9} fill="#e8957a" opacity={0.35} />
      <ellipse cx={258} cy={266} rx={16} ry={9} fill="#e8957a" opacity={0.35} />
      <path
        d="M 198 236 Q 190 262 202 266"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />

      {/* Mouth: a smile when quiet, open while speaking */}
      {mouth > 0 ? (
        <g transform="translate(200 292)">
          <ellipse rx={26} ry={5 + mouth * 17} fill="#5a2320" />
          <ellipse cy={mouth * 9} rx={14} ry={3 + mouth * 6} fill="#d9686a" />
        </g>
      ) : (
        <path
          d="M 176 290 Q 200 308 224 290"
          stroke="#5a2320"
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
