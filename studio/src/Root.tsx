import { Composition } from 'remotion';
import { Reel } from './Reel';
import { videoSchema, type Video } from './schema';
import { FPS, HEIGHT, WIDTH } from './theme';
import sample from './sample.json';

/** Half a second of breathing room after the last scene. */
const TAIL_FRAMES = 15;

export function Root() {
  return (
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
  );
}
