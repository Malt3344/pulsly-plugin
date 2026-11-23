import { Fragment } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Text whose words light up as the voice says them. Words not said yet are dimmed to
 * `before` (0 hides them while keeping the layout); the one being said can get a colour.
 */
export function Spoken({
  text,
  times,
  before = 0.3,
  spokenColour,
}: {
  text: string;
  times: number[];
  before?: number;
  spokenColour?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const parts = text.trim().split(/\s+/);

  return (
    <>
      {parts.map((part, index) => {
        const said = seconds >= (times[index] ?? 0);
        const current = said && seconds < (times[index + 1] ?? Infinity);
        return (
          <Fragment key={index}>
            {index > 0 && ' '}
            <span
              style={{
                opacity: said ? 1 : before,
                color: current && spokenColour ? spokenColour : undefined,
              }}
            >
              {part}
            </span>
          </Fragment>
        );
      })}
    </>
  );
}
