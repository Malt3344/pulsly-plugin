import { AbsoluteFill, Img } from 'remotion';
import { fonts, HEIGHT, WIDTH } from './kit/theme';

export const COLUMNS = 6;
export const PER_PAGE = 18;
const SCALE = 0.2;
export const TILE_WIDTH = WIDTH * SCALE;
export const TILE_HEIGHT = HEIGHT * SCALE;
export const LABEL = 34;
export const GAP = 12;

export interface ContactProps {
  /** Stills of the video (data URLs) with their time, made by scripts/preview.mjs. */
  tiles: { src: string; seconds: number }[];
  [key: string]: unknown;
}

export const contactHeight = (tiles: number) =>
  GAP + Math.ceil(Math.max(1, tiles) / COLUMNS) * (TILE_HEIGHT + LABEL + GAP);

/**
 * Stills of the video in a grid, so Claude can check the motion of the whole video:
 * if two neighbouring tiles look the same, nothing happened.
 */
export function Contact({ tiles }: ContactProps) {
  return (
    <AbsoluteFill
      style={{
        background: '#1a1a1a',
        padding: GAP,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        gap: GAP,
        fontFamily: fonts.sans,
      }}
    >
      {tiles.map(({ src, seconds }) => (
        <div key={seconds} style={{ width: TILE_WIDTH }}>
          <Img
            src={src}
            style={{ width: TILE_WIDTH, height: TILE_HEIGHT, borderRadius: 8, display: 'block' }}
          />
          <p
            style={{
              margin: 0,
              height: LABEL,
              lineHeight: `${LABEL}px`,
              color: '#d0d0d0',
              fontSize: 20,
            }}
          >
            {seconds.toFixed(1)}s
          </p>
        </div>
      ))}
    </AbsoluteFill>
  );
}
