import { ChevronLeftIcon, PhoneIcon, SendIcon, VideoIcon } from 'lucide-react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sfx } from '../../kit/Sfx';
import { textOn } from '../../kit/theme';
import type { Cue } from '../../kit/timing';
import type { VideoProps } from '../../kit/Video';
import { templateFonts } from '../shared/fonts';
import { TemplateFrame } from '../shared/Frame';
import { timeTexts, wordTimes } from '../shared/scenes';
import { Spoken } from '../shared/Spoken';

export interface ChatMessage {
  /** `me` on the right, `them` on the left. */
  from: 'me' | 'them';
  text: string;
  /** When it appears. Default: when its first word is said (or right after the last one). */
  on?: Cue;
  /** An emoji reaction stuck to the bubble, e.g. "😂". */
  reaction?: string;
}

export interface ChatStorySpec {
  contact: { name: string; status?: string };
  messages: ChatMessage[];
  theme?: 'dark' | 'light';
}

const THEMES = {
  dark: {
    background: '#000000',
    header: '#121214',
    them: '#26262b',
    themText: '#ffffff',
    muted: '#8e8e93',
    field: '#1c1c1f',
  },
  light: {
    background: '#ffffff',
    header: '#f6f6f8',
    them: '#e9e9eb',
    themText: '#111111',
    muted: '#8e8e93',
    field: '#f1f1f3',
  },
};

const ME = '#0a84ff';
const FONT_SIZE = 60;
const LINE = FONT_SIZE * 1.3;
const CHARS_PER_LINE = 21;
const PAD = 30;
const GAP = 22;
const TOP = 250;
const BOTTOM = 210;
/** Seconds the "typing…" dots show before their message. */
const TYPING = 0.9;

const bubbleHeight = (message: ChatMessage) =>
  Math.max(1, Math.ceil(message.text.length / CHARS_PER_LINE)) * LINE +
  PAD * 2 +
  GAP +
  (message.reaction ? 34 : 0);

function Typing({ colour, frame }: { colour: string; frame: number }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '30px 34px',
        background: colour,
        borderRadius: 40,
        width: 'fit-content',
      }}
    >
      {[0, 1, 2].map((dot) => (
        <div
          key={dot}
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: '#8e8e93',
            transform: `translateY(${Math.sin(frame / 4 - dot) * 6}px)`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * The `chat` style: a text conversation that plays out in time with the voice, with typing
 * dots before every reply, the thread scrolling up and a sound on every message.
 */
export function ChatStory({ props, chat }: { props: VideoProps; chat: ChatStorySpec }) {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const colours = THEMES[chat.theme ?? 'dark'];
  const seconds = frame / fps;
  // The first message is there from the first frame: it is the thumbnail.
  const messages = timeTexts(chat.messages, props.words).map((message, index) =>
    index === 0
      ? { ...message, at: 0, spokenAt: message.at }
      : { ...message, spokenAt: message.at },
  );
  const shown = messages.filter((message) => seconds >= message.at);
  const typing = messages.find(
    (message) => message.from === 'them' && seconds < message.at && seconds >= message.at - TYPING,
  );

  // Scroll so the newest message sits just above the input bar.
  const room = height - TOP - BOTTOM - (typing ? 140 : 0);
  const scrollFor = (count: number) =>
    Math.max(
      0,
      messages.slice(0, count).reduce((total, message) => total + bubbleHeight(message), 0) - room,
    );
  const last = shown[shown.length - 1];
  const settle =
    last && last.at > 0
      ? spring({
          frame: frame - Math.round(last.at * fps),
          fps,
          config: { damping: 16, mass: 0.5 },
        })
      : 1;
  const scroll = interpolate(
    settle,
    [0, 1],
    [scrollFor(Math.max(0, shown.length - 1)), scrollFor(shown.length)],
  );
  const initial = chat.contact.name.slice(0, 1).toUpperCase();

  return (
    <TemplateFrame props={props} background={colours.background}>
      <AbsoluteFill style={{ fontFamily: templateFonts.ui }}>
        <div
          style={{
            position: 'absolute',
            top: TOP - scroll,
            left: 40,
            right: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: GAP,
            // A small punch-in on every new message.
            transform: `scale(${1 + 0.05 * (1 - settle)})`,
            transformOrigin: `50% ${scroll + room}px`,
          }}
        >
          {shown.map((message, index) => {
            const pop =
              index === 0
                ? 1
                : spring({
                    frame: frame - Math.round(message.at * fps),
                    fps,
                    config: { damping: 12, mass: 0.45, stiffness: 220 },
                  });
            const mine = message.from === 'me';
            return (
              <div
                key={index}
                style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: 860,
                    padding: `${PAD}px 40px`,
                    borderRadius: 40,
                    borderBottomRightRadius: mine ? 12 : 40,
                    borderBottomLeftRadius: mine ? 40 : 12,
                    background: mine ? ME : colours.them,
                    color: mine ? '#ffffff' : colours.themText,
                    fontSize: FONT_SIZE,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    transform: `scale(${0.6 + pop * 0.4})`,
                    transformOrigin: mine ? 'bottom right' : 'bottom left',
                    opacity: Math.min(1, pop * 2),
                    marginBottom: message.reaction ? 34 : 0,
                  }}
                >
                  {/* Words appear as they are read; the first message shows whole (the thumbnail). */}
                  <Spoken
                    text={message.text}
                    times={wordTimes(
                      message.text,
                      props.words,
                      message.at === 0 ? messages[0]!.spokenAt : message.at,
                    )}
                    before={index === 0 ? 0.2 : 0}
                  />
                  {message.reaction && frame >= Math.round((message.at + 0.5) * fps) && (
                    <div
                      style={{
                        transform: `scale(${spring({ frame: frame - Math.round((message.at + 0.5) * fps), fps, config: { damping: 8, mass: 0.4 } }) * 1.0})`,
                        position: 'absolute',
                        bottom: -40,
                        [mine ? 'left' : 'right']: -14,
                        fontSize: 52,
                        background: colours.header,
                        borderRadius: 30,
                        padding: '2px 10px',
                        border: `4px solid ${colours.background}`,
                      }}
                    >
                      {message.reaction}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {typing && <Typing colour={colours.them} frame={frame} />}
        </div>

        {/* Header: who the chat is with. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: TOP - 40,
            paddingTop: 70,
            background: colours.header,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            paddingLeft: 30,
            paddingRight: 44,
            boxShadow: '0 1px 0 rgba(127,127,127,0.25)',
          }}
        >
          <ChevronLeftIcon size={64} color={ME} />
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              background: props.brand.accent,
              color: textOn(props.brand.accent),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 46,
              fontWeight: 900,
            }}
          >
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: colours.themText }}>
              {chat.contact.name}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: typing ? ME : colours.muted }}>
              {typing ? 'typing…' : (chat.contact.status ?? 'online')}
            </div>
          </div>
          <VideoIcon size={54} color={ME} />
          <PhoneIcon size={48} color={ME} style={{ marginLeft: 26 }} />
        </div>

        {/* The input bar. */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: BOTTOM - 40,
            background: colours.header,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 20,
            padding: '26px 36px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: 84,
              borderRadius: 42,
              background: colours.field,
              border: '2px solid rgba(127,127,127,0.25)',
              color: colours.muted,
              fontSize: 36,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 34,
            }}
          >
            Message
          </div>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              background: ME,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SendIcon size={40} color="#ffffff" />
          </div>
        </div>
      </AbsoluteFill>
      {messages.slice(1).map((message, index) => (
        <Sfx
          key={index}
          name={message.from === 'me' ? 'pop' : 'ding'}
          at={Math.round(message.at * fps)}
        />
      ))}
    </TemplateFrame>
  );
}
