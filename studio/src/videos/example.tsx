// Example: a 17-second Pulsly ad. Every shot changes something on screen at least once a
// second, on the word that is being spoken.
import { ClapperboardIcon, FileVideoIcon, MicIcon, SparklesIcon } from 'lucide-react';
import {
  Appear,
  Arrow,
  At,
  Bars,
  Big,
  Card,
  Check,
  Comment,
  Counter,
  Cursor,
  Float,
  Highlight,
  Logo,
  Notifications,
  Phone,
  Pill,
  Row,
  Shot,
  Stage,
  Stamp,
  Terminal,
  Text,
  Video,
  Window,
  type VideoProps,
} from '../kit';

const PLATFORMS = [
  { name: 'tiktok', label: 'TikTok', on: 'TikTok' },
  { name: 'instagram', label: 'Reels', on: 'Reels' },
  { name: 'youtube', label: 'Shorts', on: 'Shorts' },
  { name: 'facebook', label: 'Facebook', on: 'Facebook' },
];

export default function Example(props: VideoProps) {
  return (
    <Video props={props}>
      {/* Hook: the pain, as failing notifications piling up on a lock screen. */}
      <Shot
        from={0}
        headline={{ text: 'Posting to 4 apps is killing your week', highlight: ['killing'] }}
      >
        <Stage width={940} height={1000}>
          <At x={235} y={0}>
            <Phone width={470}>
              <Text
                size={110}
                weight={300}
                style={{ textAlign: 'center', marginTop: 40, letterSpacing: '-0.04em' }}
              >
                9:41
              </Text>
              <Text size={26} muted style={{ textAlign: 'center' }}>
                Monday, 14 October
              </Text>
            </Phone>
          </At>
          <At x={0} y={330}>
            {/* Six failures flood in within the first second: the hook is chaos at frame 0. */}
            <Notifications
              width={940}
              items={[
                { app: 'TikTok', text: 'Upload failed. Try again', time: '9:02', color: '#111111' },
                {
                  app: 'Instagram',
                  text: 'Your reel is still processing',
                  time: '9:14',
                  on: 0.15,
                  color: '#dc2743',
                },
                {
                  app: 'YouTube',
                  text: 'Add a title to publish',
                  time: '9:31',
                  on: 0.3,
                  color: '#ff0033',
                },
                {
                  app: 'Facebook',
                  text: 'Video could not be posted',
                  time: '9:48',
                  on: 0.45,
                  color: '#0866ff',
                },
                {
                  app: 'TikTok',
                  text: 'Draft expired',
                  time: '10:05',
                  on: 'killing',
                  color: '#111111',
                },
                {
                  app: 'Instagram',
                  text: 'Cover image too small',
                  time: '10:12',
                  on: 'your',
                  color: '#dc2743',
                },
              ]}
            />
          </At>
          <Stamp on="week" style={{ left: 280, top: 820 }}>
            3 hours
          </Stamp>
        </Stage>
      </Shot>

      {/* The same file, uploaded again and again. */}
      <Shot
        from="You"
        tone="light"
        transition="zoom"
        headline={{ text: 'You upload every video four times.', highlight: ['four', 'times.'] }}
      >
        <Stage width={900} height={900}>
          <At x={60} y={20}>
            <Window title="Upload" width={780}>
              <div style={{ display: 'grid', gap: 14 }}>
                {PLATFORMS.map((platform, index) => (
                  <Appear key={platform.name} on="upload" delay={index * 6} as="left" sound="pop">
                    <Row
                      leading={<Logo name={platform.name} size={58} />}
                      title={platform.label}
                      subtitle="reel-final-v3.mp4"
                      trailing={<Pill variant="neutral">Uploading…</Pill>}
                    />
                  </Appear>
                ))}
              </div>
            </Window>
          </At>
          <Appear on="four" as="zoom" style={{ position: 'absolute', left: 600, top: 520 }}>
            <Big size={210} color="#ef4444">
              4×
            </Big>
          </Appear>
          <Stamp on="times." delay={4} rotate={-8} style={{ left: 40, top: 690 }}>
            again
          </Stamp>
        </Stage>
      </Shot>

      {/* The turn: one click in Pulsly publishes to every channel. */}
      <Shot
        from="Pulsly"
        transition="push"
        headline={{ text: 'Pulsly fixes that.', highlight: ['fixes'] }}
      >
        <Stage width={940} height={980}>
          <Window url="app.pulsly.co" width={940}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text size={38} weight={800}>
                New post
              </Text>
              <Pill variant="neutral">Tue 9:00</Pill>
            </div>
            <Row
              style={{ marginTop: 22 }}
              leading={<FileVideoIcon size={46} />}
              title="reel.mp4"
              subtitle="0:32 · 1080×1920 · ready"
            />
            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              {PLATFORMS.map((platform, index) => (
                <Row
                  key={platform.name}
                  leading={<Logo name={platform.name} size={56} />}
                  title={`@yourbrand · ${platform.label}`}
                  trailing={<Check on="that" delay={6 + index * 4} size={44} />}
                />
              ))}
            </div>
            <div style={{ marginTop: 26, display: 'flex', justifyContent: 'flex-end' }}>
              <Highlight on="fixes">
                <Pill variant="solid" size={36}>
                  Publish everywhere
                </Pill>
              </Highlight>
            </div>
          </Window>
          <Cursor from={[480, 980]} to={[760, 820]} on="that" />
        </Stage>
      </Shot>

      {/* One file fans out to four platforms, each on its own word. */}
      <Shot
        from="Upload"
        tone="light"
        transition="wipe"
        headline={{ text: 'Upload once. It goes everywhere.', highlight: ['everywhere.'] }}
      >
        <Stage width={920} height={1000}>
          {/* The drop zone fills the frame from the first frame of the shot. */}
          <At x={110} y={0}>
            <div
              style={{
                width: 700,
                height: 340,
                borderRadius: 32,
                border: '5px dashed rgba(0,0,0,0.18)',
                background: 'rgba(255,255,255,0.6)',
              }}
            />
          </At>
          <At x={350} y={40}>
            <Appear on="Upload" as="left" sound="whoosh">
              <Float amount={8}>
                <Card style={{ width: 220, textAlign: 'center' }} glow>
                  <FileVideoIcon size={90} />
                  <Text size={28} muted>
                    reel.mp4
                  </Text>
                </Card>
              </Float>
            </Appear>
          </At>
          <At x={610} y={70}>
            <Appear on="once," as="pop">
              <Pill variant="solid" size={34}>
                1 upload
              </Pill>
            </Appear>
          </At>
          <At x={300} y={860}>
            <Appear on="Facebook." delay={8} as="rise" sound="ding">
              <Pill variant="green" size={38}>
                ✓ Live on 4 platforms
              </Pill>
            </Appear>
          </At>
          {PLATFORMS.map((platform, index) => {
            const x = 20 + index * 230;
            return (
              <div key={platform.name}>
                <Arrow from={[460, 300]} to={[x + 100, 560]} on={platform.on} curve={0.12} />
                <At x={x} y={580}>
                  <Appear on={platform.on} as="pop">
                    <Card
                      style={{
                        width: 200,
                        display: 'grid',
                        justifyItems: 'center',
                        gap: 14,
                        padding: 20,
                      }}
                    >
                      <Logo name={platform.name} size={84} />
                      <Text size={26}>{platform.label}</Text>
                      <Check on={platform.on} size={44} />
                    </Card>
                  </Appear>
                </At>
              </div>
            );
          })}
        </Stage>
      </Shot>

      {/* The second job: Claude makes the videos. */}
      <Shot
        from="Or"
        transition="whip"
        headline={{ text: 'Or let Claude make the videos for you.', highlight: ['Claude'] }}
      >
        <div style={{ display: 'grid', justifyItems: 'center', gap: 34 }}>
          <Terminal
            header="CLAUDE · THIS WEEK"
            status="5 VIDEOS"
            lines={[
              { text: 'script · hook in 1s', time: '00:12', on: 'Claude' },
              { text: 'voice · 87 words timed', time: '00:31', on: 'make' },
              { text: 'motion · 14 shots', time: '01:05', on: 'videos' },
              { text: 'scheduled · Mon–Fri', time: '01:09', on: 'you.', badge: 'LIVE' },
            ]}
          />
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { icon: <SparklesIcon size={30} />, label: 'Script', on: 'make' },
              { icon: <MicIcon size={30} />, label: 'Voice', on: 'the' },
              { icon: <ClapperboardIcon size={30} />, label: 'Motion', on: 'videos' },
            ].map((step) => (
              <Appear key={step.label} on={step.on} as="pop">
                <Pill size={32}>
                  {step.icon}
                  {step.label}
                </Pill>
              </Appear>
            ))}
          </div>
        </div>
      </Shot>

      {/* Proof: the number climbs while the bars grow. */}
      <Shot
        from="One"
        tone="light"
        transition="zoom"
        headline={{ text: 'One founder: 2 posts a month → 30', highlight: ['30'] }}
      >
        <Card style={{ width: 880, display: 'grid', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text size={32} muted>
              Posts per month
            </Text>
            <Counter from={2} to={30} on="thirty." frames={20} size={110} />
          </div>
          <Bars
            values={[2, 3, 5, 9, 16, 30]}
            labels={['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']}
            on="went"
          />
          <Stamp on="thirty." color="#16a34a" rotate={-8} size={84} style={{ right: 60, top: 230 }}>
            15×
          </Stamp>
        </Card>
      </Shot>

      {/* The ask. */}
      <Shot from="Comment" transition="zoom">
        <Comment keyword="POST" reward="The full setup, in your DMs" on="Comment" />
      </Shot>
    </Video>
  );
}
