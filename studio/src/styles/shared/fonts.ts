import { loadFont as loadLuckiest } from '@remotion/google-fonts/LuckiestGuy';
import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';

/** Fonts of the template styles (all SIL Open Font License, from Google Fonts). */
export const templateFonts = {
  /** Heavy caption font, as in the big talking-head channels. */
  heavy: loadMontserrat('normal', { weights: ['800', '900'], subsets: ['latin'] }).fontFamily,
  /** Chunky rounded game lettering. */
  game: loadLuckiest('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily,
  /** Friendly UI text: chat bubbles, quiz options, cards. */
  ui: loadNunito('normal', { weights: ['600', '700', '800', '900'], subsets: ['latin'] })
    .fontFamily,
};
