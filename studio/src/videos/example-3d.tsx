// Example in the explainer3d style: every shot is a 3D scene under a spotlight, with
// captions at the bottom. Set "style": "explainer3d" in the video's brand.json.
import {
  Block,
  Burst,
  Coin,
  Orb,
  Pedestal,
  Pillar,
  Screen,
  Shot,
  Stage3D,
  Video,
  type VideoProps,
} from '../kit';

export default function Example3D(props: VideoProps) {
  return (
    <Video props={props}>
      <Shot
        from={0}
        headline={{
          text: 'This video was made by an AI, and nobody touched it.',
          highlight: ['AI,'],
        }}
        scene={
          <Stage3D camera={{ from: [0, 2, 12], to: [0, 1.2, 8.5] }}>
            <Pedestal />
            <Orb />
            <Burst on="nobody" />
          </Stage3D>
        }
      >
        {null}
      </Shot>

      <Shot
        from="It"
        headline={{ text: 'It started with one sentence.', highlight: ['one'] }}
        scene={
          <Stage3D camera={{ from: [-3, 1.8, 11], to: [-1, 1.2, 9] }}>
            <Pedestal />
            <Screen lines={['1', 'sentence']} on="one" />
          </Stage3D>
        }
      >
        {null}
      </Shot>

      <Shot
        from="Claude"
        headline={{
          text: 'Claude wrote the script, built every scene in 3D, and recorded the voice.',
        }}
        scene={
          <Stage3D camera={{ from: [0, 3.5, 13], to: [0, 2.5, 11] }}>
            <Block position={[-1.8, 0, 0]} label="✎" on="script" />
            <Block position={[0, 0, 0]} label="3D" on="scene" />
            <Block position={[1.8, 0, 0]} label="♪" on="voice" />
          </Stage3D>
        }
      >
        {null}
      </Shot>

      <Shot
        from="Three"
        headline={{ text: 'Three steps, fifteen minutes, zero editing.', highlight: ['zero'] }}
        scene={
          <Stage3D camera={{ from: [2, 2, 12], to: [0.5, 1.4, 10] }}>
            <Block position={[-1.6, -0.4, 0]} label="1" on="Three" />
            <Block position={[0, 0.2, 0]} label="2" on="steps" delay={4} />
            <Block position={[1.6, 0.8, 0]} label="3" on="steps" delay={8} />
            <Coin position={[0, 2.2, 0]} on="zero" />
          </Stage3D>
        }
      >
        {null}
      </Shot>

      <Shot
        from="And"
        headline={{ text: 'And the best part is, it posts itself.', highlight: ['itself.'] }}
        scene={
          <Stage3D camera={{ from: [0, 1.4, 14], to: [0, 1.8, 10] }}>
            <Pillar />
            <Burst on="posts" />
          </Stage3D>
        }
      >
        {null}
      </Shot>
    </Video>
  );
}
