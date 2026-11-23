import type { Cue } from '../../kit/timing';

/** Where a scene plays. Each place is a fully dressed blocky world. */
export const PLACES = [
  'park',
  'city',
  'school',
  'house',
  'obby',
  'beach',
  'space',
  'shop',
] as const;
export type Place = (typeof PLACES)[number];

export const TIMES = ['day', 'sunset', 'night'] as const;
export type TimeOfDay = (typeof TIMES)[number];

/** What a character does during the scene (from its `on` cue). */
export const ACTIONS = [
  'idle',
  'talk',
  'wave',
  'point',
  'walk',
  'run',
  'enter',
  'exit',
  'jump',
  'dance',
  'sit',
  'fall',
  'celebrate',
  'cry',
  'think',
  'shrug',
  'scared',
] as const;
export type Action = (typeof ACTIONS)[number];

export const FACES = [
  'happy',
  'neutral',
  'sad',
  'angry',
  'shocked',
  'smirk',
  'cool',
  'cry',
  'love',
  'sleepy',
] as const;
export type Face = (typeof FACES)[number];

export const HAIRS = ['none', 'short', 'long', 'spiky', 'cap', 'crown', 'beanie'] as const;
export type Hair = (typeof HAIRS)[number];

/** Spots on the stage. The back ones stand further away. */
export const SLOTS = ['left', 'center', 'right', 'back-left', 'back-right'] as const;
export type Slot = (typeof SLOTS)[number];

/**
 * `wide` the whole scene; `close` a face (set `focus`); `low` heroic from below; `high` from
 * above; `orbit` circles the scene; `side` glides sideways; `over` over one shoulder at the
 * other character.
 */
export const CAMERAS = ['wide', 'close', 'low', 'high', 'orbit', 'side', 'over'] as const;
export type CameraMove = (typeof CAMERAS)[number];

export const EFFECTS = [
  'boom',
  'sparkles',
  'question',
  'exclamation',
  'hearts',
  'money',
  'zzz',
  'sweat',
] as const;
export type EffectKind = (typeof EFFECTS)[number];

export const PROPS = ['coin', 'trophy', 'gift', 'phone', 'sign', 'car', 'crate', 'cash'] as const;
export type PropKind = (typeof PROPS)[number];

export interface CharacterLook {
  /** Shown in speech bubbles. */
  name?: string;
  /** A hex colour, or a preset. Default: warm yellow. */
  skin?: string;
  shirt: string;
  pants: string;
  hair?: Hair;
  hairColor?: string;
}

export interface ActorSpec {
  /** A key of `cast`. */
  id: string;
  at: Slot;
  action?: Action;
  face?: Face;
  /** When the action (and face) starts; before it, the character stands idle and neutral. */
  on?: Cue;
}

export interface EffectSpec {
  kind: EffectKind;
  on: Cue;
  /** Over a character's head (an id of `cast`) or over a spot. */
  over: string;
}

export interface PropSpec {
  kind: PropKind;
  at: Slot;
  /** Pops in on this word; without it, it is there from the start. */
  on?: Cue;
  /** Text on a sign. */
  text?: string;
}

export interface BubbleSpec {
  /** Who says it (an id of `cast`). */
  by: string;
  text: string;
  on: Cue;
}

export interface BlockySceneSpec {
  /** The word the scene starts on (ignored for the first scene, which starts at 0). */
  from?: Cue;
  place: Place;
  time?: TimeOfDay;
  camera?: CameraMove;
  /** The character the camera is about (close, over, low). */
  focus?: string;
  actors: ActorSpec[];
  props?: PropSpec[];
  effects?: EffectSpec[];
  bubbles?: BubbleSpec[];
  /** Words that hit hard: the camera kicks on each. */
  shake?: Cue[];
  /** A white flash as the scene cuts in (use after the hook). */
  flash?: boolean;
}

export interface BlockyStorySpec {
  cast: Record<string, CharacterLook>;
  scenes: BlockySceneSpec[];
}
