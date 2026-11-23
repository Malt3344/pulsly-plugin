import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { createContext, useContext, type ReactNode } from 'react';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const fonts = {
  sans: loadInter('normal', { weights: ['500', '600', '700', '800', '900'], subsets: ['latin'] })
    .fontFamily,
  mono: loadMono('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily,
  serif: loadSerif('italic', { weights: ['400'], subsets: ['latin'] }).fontFamily,
};

/**
 * The look of a whole video. `motion`: bold motion graphics, alternating dark and light
 * shots. `paper`: warm paper with a talking presenter. `explainer3d`: 3D scenes in a dark
 * space under spotlights, with captions. The template styles (`blocky`, `gameplay`, `chat`,
 * `quiz`) are filled from a typed spec instead of drawn shot by shot: see src/styles/.
 */
export const STYLES = [
  'motion',
  'paper',
  'explainer3d',
  'blocky',
  'gameplay',
  'chat',
  'quiz',
] as const;
export type Style = (typeof STYLES)[number];

export const TONES = ['dark', 'light', 'paper', 'space'] as const;
export type Tone = (typeof TONES)[number];

/** Colours of each tone. Shots can switch tone to give the video contrast. */
export const palettes = {
  dark: {
    background: '#090c0b',
    panel: '#11171a',
    panelRaised: '#18201f',
    border: 'rgba(255,255,255,0.10)',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.56)',
    faint: 'rgba(255,255,255,0.08)',
    shadow: 'rgba(0,0,0,0.55)',
  },
  light: {
    background: '#f1f1ee',
    panel: '#ffffff',
    panelRaised: '#f7f7f5',
    border: 'rgba(0,0,0,0.09)',
    text: '#151515',
    muted: 'rgba(0,0,0,0.52)',
    faint: 'rgba(0,0,0,0.05)',
    shadow: 'rgba(15,23,42,0.16)',
  },
  paper: {
    background: '#eeeae2',
    panel: '#fffdf9',
    panelRaised: '#f7f4ee',
    border: 'rgba(40,30,20,0.12)',
    text: '#1c1a17',
    muted: 'rgba(28,26,23,0.55)',
    faint: 'rgba(60,45,30,0.06)',
    shadow: 'rgba(60,45,30,0.18)',
  },
  space: {
    background: '#04060d',
    panel: '#0e1424',
    panelRaised: '#151d33',
    border: 'rgba(160,190,255,0.16)',
    text: '#ffffff',
    muted: 'rgba(220,230,255,0.6)',
    faint: 'rgba(160,190,255,0.07)',
    shadow: 'rgba(0,0,0,0.7)',
  },
};

/** The tone shots use by default in each style. */
export const STYLE_TONE: Record<Style, Tone> = {
  motion: 'dark',
  paper: 'paper',
  explainer3d: 'space',
  blocky: 'light',
  gameplay: 'dark',
  chat: 'dark',
  quiz: 'dark',
};

export type Palette = (typeof palettes)[Tone];

export const RED = '#ef4444';
export const GREEN = '#22c55e';

export interface Brand {
  accent: string;
  style: Style;
  tone: Tone;
  handle?: string;
  /** The paper style's presenter: colours, or false to leave it out. */
  presenter?: { skin?: string; hair?: string; shirt?: string } | false;
}

const BrandContext = createContext<Brand>({ accent: '#3fe0b0', style: 'motion', tone: 'dark' });
const ToneContext = createContext<Tone>('dark');

export function BrandProvider({ brand, children }: { brand: Brand; children: ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function ToneProvider({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <ToneContext.Provider value={tone}>{children}</ToneContext.Provider>;
}

export const useBrand = () => useContext(BrandContext);

/** Colours for the current shot's tone, plus the brand accent. */
export const useColors = () => {
  const tone = useContext(ToneContext);

  return { ...palettes[tone], tone, accent: useBrand().accent };
};

/** Black or white, whichever reads better on the given #rrggbb colour. */
export const textOn = (hex: string) => {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map(
    (index) => parseInt(hex.slice(index, index + 2), 16) / 255,
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? '#07110d' : '#ffffff';
};
