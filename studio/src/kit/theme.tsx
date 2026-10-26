import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { createContext, useContext, type ReactNode } from 'react';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const fonts = {
  sans: loadInter('normal', { weights: ['500', '600', '700', '800', '900'], subsets: ['latin'] })
    .fontFamily,
  mono: loadMono('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily,
};

export const TONES = ['dark', 'light'] as const;
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
};

export type Palette = (typeof palettes)[Tone];

export const RED = '#ef4444';
export const GREEN = '#22c55e';

export interface Brand {
  accent: string;
  tone: Tone;
  handle?: string;
}

const BrandContext = createContext<Brand>({ accent: '#3fe0b0', tone: 'dark' });
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
