import { createContext, useContext } from 'react';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const fonts = {
  sans: loadInter('normal', { weights: ['500', '700', '800'], subsets: ['latin'] }).fontFamily,
  mono: loadMono('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily,
};

export const STYLES = ['dark', 'light'] as const;
export type Style = (typeof STYLES)[number];

/** Colours of each video style. `dark` is near-black, `light` is a clean off-white. */
export const palettes = {
  dark: {
    background: '#060808',
    panel: '#0c1112',
    panelBorder: 'rgba(255,255,255,0.10)',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.55)',
    grid: 'rgba(255,255,255,0.035)',
    vignette: 'rgba(0,0,0,0.75)',
    shadow: 'rgba(0,0,0,0.6)',
    titleShadow: '0 6px 40px rgba(0,0,0,0.6)',
  },
  light: {
    background: '#f6f6f3',
    panel: '#ffffff',
    panelBorder: 'rgba(0,0,0,0.08)',
    text: '#141414',
    muted: 'rgba(0,0,0,0.5)',
    grid: 'rgba(0,0,0,0.05)',
    vignette: 'rgba(0,0,0,0.05)',
    shadow: 'rgba(15,23,42,0.18)',
    titleShadow: 'none',
  },
};

export type Palette = (typeof palettes)[Style];

const PaletteContext = createContext<Palette>(palettes.dark);

export const PaletteProvider = PaletteContext.Provider;

export const usePalette = () => useContext(PaletteContext);

/** Black or white, whichever reads better on the given hex colour. */
export const textOn = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const luminance = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;

  return luminance > 0.55 ? '#04110c' : '#ffffff';
};
