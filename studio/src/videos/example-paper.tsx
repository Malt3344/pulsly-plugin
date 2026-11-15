// Example in the paper style: warm paper, serif accents and a presenter who talks along.
// Set "style": "paper" in the video's brand.json.
import { EyeIcon } from 'lucide-react';
import {
  Appear,
  Bars,
  Card,
  Check,
  Checklist,
  Counter,
  Cross,
  Logo,
  Notifications,
  Phone,
  Pill,
  Row,
  Shot,
  Stamp,
  Strike,
  Text,
  Video,
  Window,
  type VideoProps,
} from '../kit';

export default function ExamplePaper(props: VideoProps) {
  return (
    <Video props={props}>
      <Shot
        from={0}
        chapter="01 — the problem"
        headline={{ text: 'Post once, get 12 views, and quit.', highlight: ['quit.'] }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 12 }}>
            <Logo name="tiktok" size={90} />
            <div>
              <Text size={34} weight={700}>
                My first video
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <EyeIcon size={34} />
                <Counter to={12} on="twelve" size={52} />
                <Text size={30} muted>
                  views
                </Text>
              </div>
            </div>
          </div>
          <Cross on="quit" size={160} />
        </Card>
      </Shot>

      <Shot
        from="The"
        chapter="02 — the real reason"
        headline={{ text: "It's not your product. Nobody explains it.", highlight: ['explains'] }}
      >
        <Window width={760} title="your-product.com">
          <Strike on="isn't">
            <Row title="Features" subtitle="12 things it does" />
          </Strike>
          <Row title="Pricing" subtitle="$29 / month" />
          <Row title="Explainer videos" subtitle="none yet" trailing={<Pill variant="red">0</Pill>} />
          <Appear on="nobody" as="pop">
            <Pill variant="red" size={40}>
              Nobody gets it
            </Pill>
          </Appear>
        </Window>
      </Shot>

      <Shot
        from="So"
        chapter="03 — the fix"
        headline={{ text: 'Claude writes, draws and posts it.', highlight: ['posts'] }}
      >
        <Checklist
          items={[
            { text: 'Writes a script', on: 'writes' },
            { text: 'Draws every scene', on: 'draws' },
            { text: 'Posts the video', on: 'posts' },
          ]}
        />
        <Stamp on="video" style={{ top: 40, right: 60 }}>
          DAILY
        </Stamp>
      </Shot>

      <Shot
        from="Thirty"
        chapter="04 — 30 days later"
        headline={{ text: '30 videos, and your first customers.', highlight: ['customers'] }}
      >
        <Phone width={460}>
          <Bars values={[2, 5, 9, 16, 28, 47]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6']} on="Thirty" />
          <Notifications
            items={[
              { app: 'Stripe', text: 'New customer · $29', on: 'first', color: '#635bff' },
              { app: 'Stripe', text: 'New customer · $29', on: 'customers', color: '#635bff' },
            ]}
          />
          <Check on="found" size={120} />
        </Phone>
      </Shot>
    </Video>
  );
}
