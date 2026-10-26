import { AbsoluteFill, Freeze } from 'remotion';
import { Reel } from './Reel';
import type { Video } from './schema';
import { FPS, HEIGHT, WIDTH, fonts } from './theme';

export const CONTACT_COLUMNS = 5;
export const TILE_SCALE = 0.25;
export const TILE_WIDTH = WIDTH * TILE_SCALE;
export const TILE_HEIGHT = HEIGHT * TILE_SCALE;
export const LABEL_HEIGHT = 44;
export const GAP = 16;

/** The frame where a scene has settled: 85% of the way through it. */
const settledFrame = ({ start, end }: Video['scenes'][number]) =>
  Math.round((start + (end - start) * 0.85) * FPS);

/** One still per scene in a grid, so the whole video can be checked at a glance. */
export function Contact(video: Video) {
  return (
    <AbsoluteFill
      style={{
        background: '#1a1a1a',
        padding: GAP,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        gap: GAP,
        fontFamily: fonts.sans,
      }}
    >
      {video.scenes.map((scene, index) => (
        <div key={scene.start} style={{ width: TILE_WIDTH }}>
          <div
            style={{
              position: 'relative',
              width: TILE_WIDTH,
              height: TILE_HEIGHT,
              overflow: 'hidden',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                width: WIDTH,
                height: HEIGHT,
                transform: `scale(${TILE_SCALE})`,
                transformOrigin: 'top left',
              }}
            >
              <Freeze frame={settledFrame(scene)}>
                <Reel {...video} audio={undefined} />
              </Freeze>
            </div>
          </div>
          <p
            style={{
              margin: 0,
              height: LABEL_HEIGHT,
              lineHeight: `${LABEL_HEIGHT}px`,
              color: '#cfcfcf',
              fontSize: 18,
            }}
          >
            Scene {index + 1} · {scene.start.toFixed(1)}–{scene.end.toFixed(1)}s
          </p>
        </div>
      ))}
    </AbsoluteFill>
  );
}
