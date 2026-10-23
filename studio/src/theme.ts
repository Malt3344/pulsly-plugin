import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const fonts = {
  sans: loadInter('normal', { weights: ['500', '700', '800'], subsets: ['latin'] }).fontFamily,
  mono: loadMono('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily,
};

export const colors = {
  background: '#060808',
  panel: '#0c1112',
  panelBorder: 'rgba(255,255,255,0.10)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.55)',
  ink: '#04110c',
};
