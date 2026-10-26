import { z } from 'zod';
import { STYLES } from './theme';

/** A spoken word with its time in seconds, from the voiceover. */
export const wordSchema = z.object({
  text: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
});

/** Big headline at the top. Words in `highlight` get an accent pill, e.g. "Sell [the] [job.]". */
const titleSchema = z.object({
  text: z.string().min(1),
  highlight: z.array(z.string()).default([]),
});

const tagSchema = z.object({ type: z.literal('tag'), label: z.string().min(1) });

const terminalSchema = z.object({
  type: z.literal('terminal'),
  header: z.string().default('AGENT · LOG'),
  status: z.string().default('RUNNING'),
  lines: z
    .array(
      z.object({
        text: z.string(),
        time: z.string().optional(),
        badge: z.string().default('DONE'),
      }),
    )
    .min(1)
    .max(6),
});

const stickerSchema = z.object({
  type: z.literal('sticker'),
  top: z.string().default('HELLO'),
  subtitle: z.string().default('my name is'),
  name: z.string().min(1),
});

const statSchema = z.object({
  type: z.literal('stat'),
  value: z.number(),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
  label: z.string().min(1),
});

const checklistSchema = z.object({
  type: z.literal('checklist'),
  items: z.array(z.string().min(1)).min(1).max(5),
});

const ctaSchema = z.object({
  type: z.literal('cta'),
  /** The word people comment, e.g. "RIP". */
  keyword: z.string().min(1),
  text: z.string().min(1),
});

const chartSchema = z.object({
  type: z.literal('chart'),
  kind: z.enum(['line', 'bar']).default('line'),
  /** 2–12 values, drawn left to right; the last one is labelled. */
  values: z.array(z.number()).min(2).max(12),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
  label: z.string().min(1),
});

const compareSchema = z.object({
  type: z.literal('compare'),
  before: z.object({ title: z.string().min(1), items: z.array(z.string().min(1)).min(1).max(4) }),
  after: z.object({ title: z.string().min(1), items: z.array(z.string().min(1)).min(1).max(4) }),
});

const notificationsSchema = z.object({
  type: z.literal('notifications'),
  /** Phone lock-screen notifications that stack in, e.g. { app: 'Stripe', text: 'You received $49.00' }. */
  items: z
    .array(
      z.object({
        app: z.string().min(1),
        text: z.string().min(1),
        time: z.string().default('now'),
      }),
    )
    .min(1)
    .max(4),
});

const imageSchema = z.object({
  type: z.literal('image'),
  /** An image inside public/, e.g. "brand/dashboard.png" — real product screens look best. */
  src: z.string().min(1),
  frame: z.enum(['browser', 'phone', 'none']).default('browser'),
  /** Shown in the browser frame's address bar. */
  url: z.string().optional(),
});

const quoteSchema = z.object({
  type: z.literal('quote'),
  text: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
});

export const visualSchema = z.discriminatedUnion('type', [
  tagSchema,
  terminalSchema,
  stickerSchema,
  statSchema,
  checklistSchema,
  ctaSchema,
  chartSchema,
  compareSchema,
  notificationsSchema,
  imageSchema,
  quoteSchema,
]);

export const sceneSchema = z
  .object({
    start: z.number().nonnegative(),
    end: z.number().positive(),
    title: titleSchema.optional(),
    /** Stacked under the title, each animating in shortly after the previous one. */
    visuals: z.array(visualSchema).max(3).default([]),
  })
  .refine(({ start, end }) => end > start, { message: 'end must be after start' });

export const videoSchema = z.object({
  /** Voiceover file inside public/, e.g. "videos/my-reel/voice.wav". */
  audio: z.string().optional(),
  /** `dark` (near-black) or `light` (clean off-white). */
  style: z.enum(STYLES).default('dark'),
  /** Accent colour for highlights, badges and glow, as #rrggbb. */
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default('#3fe0b0'),
  /** Brand handle shown small at the top, e.g. "@pulsly". */
  handle: z.string().optional(),
  /** Word-by-word captions at the bottom; most people watch without sound. */
  captions: z.boolean().default(true),
  /** Thin progress bar at the top that shows how much is left. */
  progress: z.boolean().default(true),
  words: z.array(wordSchema).default([]),
  scenes: z.array(sceneSchema).min(1),
});

export type Word = z.infer<typeof wordSchema>;
export type Title = z.infer<typeof titleSchema>;
export type Visual = z.infer<typeof visualSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type Video = z.infer<typeof videoSchema>;
