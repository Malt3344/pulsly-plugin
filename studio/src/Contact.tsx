import type { ComponentType } from 'react';
import { AbsoluteFill, Freeze } from 'remotion';
import { fonts, FPS, HEIGHT, WIDTH } from './kit/theme';
import type { VideoProps } from './kit/Video';

export const COLUMNS = 6;
export const PER_PAGE = 18;
const SCALE = 0.2;
export const TILE_WIDTH = WIDTH * SCALE;
export const TILE_HEIGHT = HEIGHT * SCALE;
export const LABEL = 34;
export const GAP = 12;

export interface ContactProps extends VideoProps {
  /** Seconds between stills. */
  interval: number;
  page: number;
  durationInSeconds: number;
}

/**
 * Stills every `interval` seconds in a grid, so Claude can check the motion of
 * the whole video: if two neighbouring tiles look the same, nothing happened.
 */
export function makeContact(VideoComponent: ComponentType<VideoProps>) {
  return function Contact(props: ContactProps) {
    const { interval, page, durationInSeconds } = props;
    const times = Array.from(
      { length: Math.floor(durationInSeconds / interval) + 1 },
      (_, index) => index * interval,
    ).slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
        {times.map((seconds) => (
          <div key={seconds} style={{ width: TILE_WIDTH }}>
            <div
              style={{
                width: TILE_WIDTH,
                height: TILE_HEIGHT,
                overflow: 'hidden',
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: WIDTH,
                  height: HEIGHT,
                  transform: `scale(${SCALE})`,
                  transformOrigin: 'top left',
                }}
              >
                <Freeze frame={Math.round(seconds * FPS)}>
                  <VideoComponent {...props} audio={undefined} music={false} />
                </Freeze>
              </div>
            </div>
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
  };
}
