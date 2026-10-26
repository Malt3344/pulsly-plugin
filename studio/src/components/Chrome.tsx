import { useCurrentFrame, useVideoConfig } from 'remotion';
import { fonts, usePalette } from '../theme';

/** Thin bar along the top showing how much of the video is left. */
export function ProgressBar({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 10,
        background: 'rgba(127,127,127,0.18)',
      }}
    >
      <div
        style={{
          width: `${(frame / durationInFrames) * 100}%`,
          height: '100%',
          background: accent,
        }}
      />
    </div>
  );
}

/** The brand's handle, small at the top, so reposts still credit you. */
export function Handle({ handle }: { handle: string }) {
  const colors = usePalette();

  return (
    <div
      style={{
        position: 'absolute',
        top: 130,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: fonts.sans,
        fontWeight: 700,
        fontSize: 32,
        color: colors.muted,
        letterSpacing: '0.02em',
      }}
    >
      {handle}
    </div>
  );
}
