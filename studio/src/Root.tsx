import { Composition } from 'remotion';
import { CONTACT_COLUMNS, Contact, GAP, LABEL_HEIGHT, TILE_HEIGHT, TILE_WIDTH } from './Contact';
import { Reel } from './Reel';
import { videoSchema, type Video } from './schema';
import { FPS, HEIGHT, WIDTH } from './theme';
import sample from './sample.json';

/** Half a second of breathing room after the last scene. */
const TAIL_FRAMES = 15;

export function Root() {
  return (
    <>
      <Composition
        id="Reel"
        component={Reel}
        schema={videoSchema}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={FPS * 10}
        defaultProps={videoSchema.parse(sample) as Video}
        calculateMetadata={({ props }) => {
          const video = videoSchema.parse(props);
          const end = Math.max(...video.scenes.map((scene) => scene.end));

          return { props: video, durationInFrames: Math.ceil(end * FPS) + TAIL_FRAMES };
        }}
      />
      <Composition
        id="Contact"
        component={Contact}
        schema={videoSchema}
        width={GAP + CONTACT_COLUMNS * (TILE_WIDTH + GAP)}
        height={TILE_HEIGHT}
        fps={FPS}
        durationInFrames={1}
        defaultProps={videoSchema.parse(sample) as Video}
        calculateMetadata={({ props }) => {
          const video = videoSchema.parse(props);
          const columns = Math.min(CONTACT_COLUMNS, video.scenes.length);
          const rows = Math.ceil(video.scenes.length / CONTACT_COLUMNS);
          const end = Math.max(...video.scenes.map((scene) => scene.end));

          return {
            props: video,
            // As long as the reel, so every scene exists when <Freeze> jumps to it.
            durationInFrames: Math.ceil(end * FPS) + TAIL_FRAMES,
            width: GAP + columns * (TILE_WIDTH + GAP),
            height: GAP + rows * (TILE_HEIGHT + LABEL_HEIGHT + GAP),
          };
        }}
      />
    </>
  );
}
