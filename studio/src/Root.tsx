import { Composition } from 'remotion';
import {
  COLUMNS,
  GAP,
  LABEL,
  makeContact,
  PER_PAGE,
  TILE_HEIGHT,
  TILE_WIDTH,
  type ContactProps,
} from './Contact';
import CurrentVideo from './current';
import { TAIL_SECONDS } from './kit/Shot';
import { FPS, HEIGHT, WIDTH } from './kit/theme';
import type { VideoProps } from './kit/Video';

const durationOf = (props: VideoProps) => {
  const lastWord = props.words[props.words.length - 1];
  return (lastWord ? lastWord.end : 10) + TAIL_SECONDS;
};

const defaults: VideoProps = {
  slug: 'example',
  words: [],
  brand: { accent: '#3fe0b0', tone: 'dark' },
};

const Contact = makeContact(CurrentVideo);

/** "Reel" is the video; "Contact" is the contact sheet used to check it. */
export function Root() {
  return (
    <>
      <Composition
        id="Reel"
        component={CurrentVideo}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={FPS * 10}
        defaultProps={defaults}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.ceil(durationOf(props) * FPS),
        })}
      />
      <Composition
        id="Contact"
        component={Contact}
        width={GAP + COLUMNS * (TILE_WIDTH + GAP)}
        height={GAP + 3 * (TILE_HEIGHT + LABEL + GAP)}
        fps={FPS}
        durationInFrames={FPS * 10}
        defaultProps={
          { ...defaults, interval: 1, page: 1, durationInSeconds: 10 } satisfies ContactProps
        }
        calculateMetadata={({ props }) => {
          const durationInSeconds = durationOf(props);
          const tiles = Math.min(
            PER_PAGE,
            Math.floor(durationInSeconds / props.interval) + 1 - (props.page - 1) * PER_PAGE,
          );
          const rows = Math.ceil(Math.max(1, tiles) / COLUMNS);

          return {
            props: { ...props, durationInSeconds },
            // As long as the video, so every frame exists when <Freeze> jumps to it.
            durationInFrames: Math.ceil(durationInSeconds * FPS),
            height: GAP + rows * (TILE_HEIGHT + LABEL + GAP),
          };
        }}
      />
    </>
  );
}
