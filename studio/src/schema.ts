import { z } from 'zod';

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

export const visualSchema = z.discriminatedUnion('type', [
  tagSchema,
  terminalSchema,
  stickerSchema,
  statSchema,
  checklistSchema,
  ctaSchema,
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
  /** Accent colour for highlights, badges and glow. */
  accent: z.string().default('#3fe0b0'),
  words: z.array(wordSchema).default([]),
  scenes: z.array(sceneSchema).min(1),
});

export type Word = z.infer<typeof wordSchema>;
export type Title = z.infer<typeof titleSchema>;
export type Visual = z.infer<typeof visualSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type Video = z.infer<typeof videoSchema>;
