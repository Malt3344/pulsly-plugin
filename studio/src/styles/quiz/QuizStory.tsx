import { CheckIcon } from 'lucide-react';
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Sfx } from '../../kit/Sfx';
import { GREEN, RED, textOn } from '../../kit/theme';
import type { Cue } from '../../kit/timing';
import type { VideoProps } from '../../kit/Video';
import { templateFonts } from '../shared/fonts';
import { TemplateFrame } from '../shared/Frame';
import { cueAfter, timeTexts, wordTimes } from '../shared/scenes';
import { Spoken } from '../shared/Spoken';
import type { Word } from '../../kit/timing';

export interface TriviaRound {
  question: string;
  /** Two to four answers. */
  options: string[];
  /** Index of the right answer in `options`. */
  answer: number;
  /** When the question appears. Default: when its first word is said. */
  on?: Cue;
  /** When the answer is revealed. Default: when the right answer is said after the question. */
  reveal?: Cue;
}

export interface WouldYouRatherRound {
  a: string;
  b: string;
  /** Share of people who picked `a` (0–100); `b` gets the rest. */
  aPercent: number;
  on?: Cue;
  /** When the percentages show. Default: just before the next round. */
  reveal?: Cue;
}

export type QuizSpec = (
  | { kind: 'trivia'; title: string; rounds: TriviaRound[] }
  | { kind: 'would-you-rather'; title: string; rounds: WouldYouRatherRound[] }
) & {
  /** The call to action at the end, popping up when its first word is said. */
  cta?: string;
};

const LETTERS = ['A', 'B', 'C', 'D'];
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

function TitleBar({
  title,
  round,
  rounds,
  accent,
}: {
  title: string;
  round: number;
  rounds: number;
  accent: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 110,
        left: 60,
        right: 60,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: templateFonts.ui,
        fontWeight: 900,
      }}
    >
      <div
        style={{
          background: accent,
          color: textOn(accent),
          borderRadius: 999,
          padding: '14px 34px',
          fontSize: 40,
          maxWidth: 720,
        }}
      >
        {title}
      </div>
      <div style={{ color: '#ffffff', fontSize: 44, opacity: 0.85 }}>
        {round + 1}/{rounds}
      </div>
    </div>
  );
}

/** A ring that empties from the question to the reveal, with the seconds left inside. */
function Countdown({ start, reveal, accent }: { start: number; reveal: number; accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const left = interpolate(seconds, [start, reveal], [1, 0], clamp);
  const r = 70;
  const circumference = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
      <svg width={180} height={180} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={90}
          cy={90}
          r={r}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={16}
          fill="none"
        />
        <circle
          cx={90}
          cy={90}
          r={r}
          stroke={left < 0.3 ? RED : accent}
          strokeWidth={16}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - left)}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: templateFonts.game,
          fontSize: 76,
        }}
      >
        {Math.max(0, Math.ceil(reveal - seconds))}
      </div>
    </div>
  );
}

function TriviaView({
  round,
  start,
  spokenAt,
  reveal,
  accent,
  words,
}: {
  round: TriviaRound;
  start: number;
  spokenAt: number;
  reveal: number;
  accent: string;
  words: Word[];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // The first round is complete from the first frame: it is the thumbnail.
  const local = start === 0 ? 60 : frame - Math.round(start * fps);
  const revealed = seconds >= reveal;
  const revealPop = spring({
    frame: frame - Math.round(reveal * fps),
    fps,
    config: { damping: 9, mass: 0.5 },
  });

  return (
    <AbsoluteFill
      style={{
        padding: '220px 56px 160px',
        fontFamily: templateFonts.ui,
        gap: 40,
        justifyContent: 'center',
      }}
    >
      <Countdown start={start} reveal={reveal} accent={accent} />
      <div
        style={{
          background: '#ffffff',
          color: '#111318',
          borderRadius: 40,
          padding: '50px 50px',
          fontSize: 74,
          fontWeight: 900,
          lineHeight: 1.15,
          textAlign: 'center',
          // Pulses with every second of the countdown.
          transform: `scale(${spring({ frame: local, fps, config: { damping: 12, mass: 0.5 } }) * (revealed ? 1 : 1 + 0.025 * Math.max(0, 1 - ((seconds - spokenAt) % 1) * 4))})`,
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        <Spoken
          text={round.question}
          times={wordTimes(round.question, words, spokenAt)}
          before={start === 0 ? 0.6 : 0.28}
        />
      </div>
      <div style={{ display: 'grid', gap: 22 }}>
        {round.options.map((option, index) => {
          const right = index === round.answer;
          // Flashes when the voice reads it out.
          const readAt = cueAfter(words, option.split(/\s+/)[0] ?? option, spokenAt + 0.2, -10);
          const read = Math.max(0, 1 - (seconds - readAt) / 0.5) * (seconds >= readAt ? 1 : 0);
          const enter = spring({
            frame: local - 6 - index * 5,
            fps,
            config: { damping: 13, mass: 0.5 },
          });
          const background = revealed
            ? right
              ? GREEN
              : 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.14)';
          return (
            <div
              key={option}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                background,
                border: `4px solid ${revealed && right ? '#ffffff' : read > 0 ? accent : 'rgba(255,255,255,0.18)'}`,
                borderRadius: 32,
                padding: '30px 34px',
                color: '#ffffff',
                fontSize: 62,
                fontWeight: 800,
                opacity: revealed && !right ? 0.45 : 1,
                transform: `translateX(${(1 - enter) * (index % 2 ? 120 : -120)}px) scale(${revealed && right ? 1 + revealPop * 0.05 : 1 + read * 0.06})`,
              }}
            >
              <span
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 20,
                  background: revealed && right ? '#ffffff' : accent,
                  color: revealed && right ? GREEN : textOn(accent),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {revealed && right ? <CheckIcon size={48} strokeWidth={4} /> : LETTERS[index]}
              </span>
              {option}
            </div>
          );
        })}
      </div>
      {revealed && <Confetti startFrame={Math.round(reveal * fps)} />}
    </AbsoluteFill>
  );
}

const CONFETTI_COLOURS = ['#22c55e', '#facc15', '#38bdf8', '#f472b6', '#ffffff', '#a78bfa'];

/** A burst of confetti from the middle of the screen, falling over 1.5 seconds. */
function Confetti({ startFrame }: { startFrame: number }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = (frame - startFrame) / fps;
  if (t < 0 || t > 1.6) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: 70 }, (_, index) => {
        const angle = random(`ca${index}`) * Math.PI * 2;
        const speed = 900 + random(`cs${index}`) * 1300;
        const x = width / 2 + Math.cos(angle) * speed * t;
        const y = height * 0.45 + Math.sin(angle) * speed * t * 0.8 + 1600 * t * t;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 22,
              height: 36,
              background: CONFETTI_COLOURS[index % CONFETTI_COLOURS.length],
              transform: `rotate(${t * 720 * (random(`cr${index}`) - 0.5)}deg)`,
              opacity: Math.min(1, (1.6 - t) * 3),
              borderRadius: 4,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

function CallToAction({ text, at, accent }: { text: string; at: number; accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const since = frame - Math.round(at * fps);
  if (since < 0) return null;
  const pop = spring({ frame: since, fps, config: { damping: 9, mass: 0.5 } });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 230 }}>
      <div
        style={{
          background: accent,
          color: textOn(accent),
          fontFamily: templateFonts.game,
          fontSize: 76,
          padding: '28px 54px',
          borderRadius: 999,
          transform: `scale(${pop}) rotate(${Math.sin(since / 5) * 2}deg)`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        }}
      >
        {text} 👇
      </div>
    </AbsoluteFill>
  );
}

function WouldYouRatherView({
  round,
  start,
  spokenAt,
  reveal,
  words,
}: {
  round: WouldYouRatherRound;
  start: number;
  spokenAt: number;
  reveal: number;
  words: Word[];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = start === 0 ? 60 : frame - Math.round(start * fps);
  const shown = spring({
    frame: frame - Math.round(reveal * fps),
    fps,
    config: { damping: 18, mass: 0.8 },
  });
  const visible = frame >= Math.round(reveal * fps);
  const aAt = spokenAt;
  const bAt = cueAfter(words, round.b.split(/\s+/)[0] ?? round.b, aAt + 0.3, aAt + 1.5);
  const half = (text: string, percent: number, colour: string, top: boolean, delay: number) => {
    const enter = spring({ frame: local - delay, fps, config: { damping: 13, mass: 0.6 } });
    const winner = visible && percent >= 50;
    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          [top ? 'top' : 'bottom']: 0,
          height: '50%',
          background: colour,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: top ? '180px 80px 110px' : '110px 80px 160px',
          textAlign: 'center',
          color: '#ffffff',
          fontFamily: templateFonts.ui,
        }}
      >
        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            lineHeight: 1.15,
            transform: `scale(${enter})`,
            textShadow: '0 6px 0 rgba(0,0,0,0.2)',
          }}
        >
          <Spoken text={text} times={wordTimes(text, words, top ? aAt : bAt)} before={0.35} />
        </div>
        {visible && (
          <div
            style={{
              marginTop: 30,
              fontFamily: templateFonts.game,
              fontSize: winner ? 140 : 110,
              transform: `scale(${0.5 + shown * 0.5})`,
              textShadow: '0 8px 0 rgba(0,0,0,0.25)',
            }}
          >
            {Math.round(percent * shown)}%
          </div>
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill>
      {half(round.a, round.aPercent, RED, true, 0)}
      {half(round.b, 100 - round.aPercent, '#3b82f6', false, 8)}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 170,
          height: 170,
          borderRadius: 85,
          background: '#ffffff',
          border: '10px solid #111318',
          transform: `translate(-50%, -50%) scale(${spring({ frame: local - 4, fps, config: { damping: 10, mass: 0.5 } })})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: templateFonts.game,
          fontSize: 72,
          color: '#111318',
        }}
      >
        OR
      </div>
    </AbsoluteFill>
  );
}

/**
 * The `quiz` style: trivia questions with a countdown and the answer revealed on its word,
 * or "would you rather" with the split of answers. The voice reads the questions.
 */
export function QuizStory({ props, quiz }: { props: VideoProps; quiz: QuizSpec }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = props.words;
  const accent = props.brand.accent;
  const end = (words[words.length - 1]?.end ?? 10) + 0.8;
  const seconds = frame / fps;

  const rounds = (
    quiz.kind === 'trivia'
      ? timeTexts(
          quiz.rounds.map((round) => ({ ...round, text: round.question })),
          words,
        )
      : timeTexts(
          quiz.rounds.map((round) => ({ ...round, text: round.a })),
          words,
        )
  ).map((round, index, all) => {
    const start = index === 0 ? 0 : round.at;
    const next = all[index + 1]?.at ?? end;
    const fallback =
      quiz.kind === 'trivia'
        ? Math.min(start + 3.5, next - 0.8)
        : Math.max(start + 1.5, next - 1.4);
    const answerWord =
      quiz.kind === 'trivia'
        ? (quiz.rounds[index] as TriviaRound).options[
            (quiz.rounds[index] as TriviaRound).answer
          ]?.split(/\s+/)[0]
        : undefined;
    const reveal = cueAfter(words, round.reveal ?? answerWord, round.at + 0.3, fallback);
    return { start, spokenAt: round.at, reveal: Math.min(reveal, next - 0.2), index };
  });
  const current = [...rounds].reverse().find((round) => seconds >= round.start) ?? rounds[0]!;

  return (
    <TemplateFrame props={props} background="#14112a">
      <AbsoluteFill
        style={{ background: `radial-gradient(circle at 50% 30%, ${accent}33, #14112a 65%)` }}
      />
      {quiz.kind === 'trivia' ? (
        <TriviaView
          key={current.index}
          round={quiz.rounds[current.index]!}
          start={current.start}
          spokenAt={current.spokenAt}
          reveal={current.reveal}
          accent={accent}
          words={words}
        />
      ) : (
        <WouldYouRatherView
          key={current.index}
          round={quiz.rounds[current.index]!}
          start={current.start}
          spokenAt={current.spokenAt}
          reveal={current.reveal}
          words={words}
        />
      )}
      {quiz.kind === 'trivia' && (
        <TitleBar title={quiz.title} round={current.index} rounds={rounds.length} accent={accent} />
      )}
      {quiz.kind === 'would-you-rather' && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: templateFonts.game,
            fontSize: 64,
            color: '#ffffff',
            textShadow: '0 6px 0 rgba(0,0,0,0.3)',
            opacity: interpolate(seconds, [current.start, current.start + 0.3], [0.6, 1], clamp),
          }}
        >
          {quiz.title}
        </div>
      )}
      {quiz.cta && (
        <CallToAction
          text={quiz.cta}
          at={cueAfter(
            words,
            quiz.cta.split(/\s+/)[0] ?? '',
            rounds[rounds.length - 1]!.reveal,
            end - 1.2,
          )}
          accent={accent}
        />
      )}
      {rounds.flatMap((round) => [
        ...(round.index > 0
          ? [<Sfx key={`w${round.index}`} name="whoosh" at={Math.round(round.start * fps) - 3} />]
          : []),
        <Sfx key={`r${round.index}`} name="ding" at={Math.round(round.reveal * fps)} />,
        ...(quiz.kind === 'trivia'
          ? Array.from(
              { length: Math.max(0, Math.floor(round.reveal - round.start - 0.5)) },
              (_, tick) => (
                <Sfx
                  key={`t${round.index}-${tick}`}
                  name="tick"
                  at={Math.round((round.reveal - tick - 1) * fps)}
                  volume={0.2}
                />
              ),
            )
          : []),
      ])}
    </TemplateFrame>
  );
}
