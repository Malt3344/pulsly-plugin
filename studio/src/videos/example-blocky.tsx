import type { VideoProps } from '../kit';
import { BlockyStory } from '../styles/blocky';

// The finished example of the `blocky` style: a whole story in one typed spec.
export default function ExampleBlocky(props: VideoProps) {
  return (
    <BlockyStory
      props={props}
      story={{
        cast: {
          max: {
            name: 'Max',
            shirt: '#3b82f6',
            pants: '#1f2a44',
            hair: 'cap',
            hairColor: '#e11d48',
          },
          lily: {
            name: 'Lily',
            skin: 'light',
            shirt: '#f472b6',
            pants: '#4c1d95',
            hair: 'long',
            hairColor: '#7c3f1d',
          },
          crowd1: { shirt: '#22c55e', pants: '#334155', hair: 'short' },
          crowd2: {
            skin: 'brown',
            shirt: '#f59e0b',
            pants: '#1e293b',
            hair: 'spiky',
            hairColor: '#111827',
          },
        },
        scenes: [
          {
            place: 'city',
            camera: 'low',
            focus: 'max',
            actors: [{ id: 'max', at: 'center', action: 'think', face: 'smirk' }],
            effects: [{ kind: 'question', on: 'zero', over: 'max' }],
            shake: ['idea.'],
          },
          {
            from: 'He',
            place: 'park',
            camera: 'wide',
            flash: true,
            actors: [{ id: 'max', at: 'center', action: 'wave', face: 'happy' }],
            props: [{ kind: 'sign', at: 'right', text: 'LEMONADE', on: 'lemonade' }],
          },
          {
            from: 'Nobody',
            place: 'park',
            camera: 'close',
            focus: 'max',
            actors: [{ id: 'max', at: 'center', action: 'cry', face: 'cry', on: 'Not' }],
            effects: [{ kind: 'sweat', on: 'Nobody', over: 'max' }],
          },
          {
            from: 'Then',
            place: 'park',
            camera: 'over',
            focus: 'lily',
            actors: [
              { id: 'max', at: 'left', action: 'idle', face: 'sad' },
              { id: 'lily', at: 'right', action: 'enter', face: 'smirk' },
            ],
            bubbles: [{ by: 'lily', text: 'I have a plan.', on: 'plan.' }],
            effects: [{ kind: 'exclamation', on: 'plan.', over: 'lily' }],
          },
          {
            from: 'She',
            place: 'park',
            camera: 'side',
            actors: [{ id: 'lily', at: 'left', action: 'point', face: 'happy' }],
            props: [{ kind: 'sign', at: 'right', text: 'FREE HUGS', on: 'sign' }],
            effects: [{ kind: 'hearts', on: 'hugs.', over: 'right' }],
          },
          {
            from: 'Suddenly',
            place: 'city',
            camera: 'high',
            actors: [
              { id: 'crowd1', at: 'back-left', action: 'run', face: 'happy' },
              { id: 'crowd2', at: 'back-right', action: 'run', face: 'love' },
              { id: 'max', at: 'center', action: 'scared', face: 'shocked' },
            ],
            shake: ['city'],
          },
          {
            from: 'Max',
            place: 'park',
            camera: 'orbit',
            actors: [
              { id: 'max', at: 'left', action: 'celebrate', face: 'happy' },
              { id: 'lily', at: 'right', action: 'dance', face: 'cool' },
            ],
            props: [{ kind: 'cash', at: 'center', on: 'hundred' }],
            effects: [
              { kind: 'money', on: 'hundred', over: 'center' },
              { kind: 'sparkles', on: 'day.', over: 'max' },
            ],
          },
          {
            from: 'The',
            place: 'park',
            time: 'sunset',
            camera: 'close',
            focus: 'max',
            actors: [{ id: 'max', at: 'center', action: 'talk', face: 'cool', on: 'People' }],
            effects: [{ kind: 'boom', on: 'feeling.', over: 'max' }],
            shake: ['feeling.'],
          },
        ],
      }}
    />
  );
}
