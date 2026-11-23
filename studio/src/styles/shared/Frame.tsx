import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { BrandProvider } from '../../kit/theme';
import { WordsProvider } from '../../kit/timing';
import { ProgressBar, Soundtrack, type VideoProps } from '../../kit/Video';
import { Captions, type CaptionLook } from './Captions';

interface TemplateFrameProps {
  props: VideoProps;
  background: string;
  /** Burned-in captions of the voice, or false for styles where the words are on screen. */
  captions?: { look: CaptionLook; y?: number } | false;
  children: ReactNode;
}

/** The root of every template style: voice, music, captions and the progress bar. */
export function TemplateFrame({
  props,
  background,
  captions = false,
  children,
}: TemplateFrameProps) {
  const { audio, words, brand, music = true } = props;

  return (
    <BrandProvider brand={brand}>
      <WordsProvider words={words}>
        <AbsoluteFill style={{ backgroundColor: background, overflow: 'hidden' }}>
          {children}
          {captions && (
            <Captions words={words} accent={brand.accent} look={captions.look} y={captions.y} />
          )}
          <Soundtrack audio={audio} words={words} music={music} />
          <ProgressBar accent={brand.accent} />
        </AbsoluteFill>
      </WordsProvider>
    </BrandProvider>
  );
}
