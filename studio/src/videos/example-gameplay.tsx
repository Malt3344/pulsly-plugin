import type { VideoProps } from '../kit';
import { GameplayStory } from '../styles/gameplay';

// The finished example of the `gameplay` style: the story only needs a title and a course.
export default function ExampleGameplay(props: VideoProps) {
  return (
    <GameplayStory
      props={props}
      story={{
        title: 'I quit my job to sell candles and my family laughed at me',
        author: 'Maya',
        course: 'lava',
        runner: {
          shirt: '#f97316',
          pants: '#1e293b',
          hair: 'long',
          hairColor: '#3b2416',
          skin: 'tan',
        },
      }}
    />
  );
}
