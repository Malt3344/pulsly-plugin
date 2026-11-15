import { Composition } from 'remotion';
import { COLUMNS, Contact, contactHeight, GAP, TILE_WIDTH, type ContactProps } from './Contact';
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
  brand: { accent: '#3fe0b0', style: 'motion', tone: 'dark' },
};

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
        height={contactHeight(1)}
        fps={FPS}
        durationInFrames={1}
        defaultProps={{ tiles: [] } satisfies ContactProps}
        calculateMetadata={({ props }) => ({ height: contactHeight(props.tiles.length) })}
      />
    </>
  );
}
