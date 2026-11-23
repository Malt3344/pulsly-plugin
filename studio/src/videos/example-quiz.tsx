import type { VideoProps } from '../kit';
import { QuizStory } from '../styles/quiz';

// The finished example of the `quiz` style: each answer is revealed on its spoken word.
export default function ExampleQuiz(props: VideoProps) {
  return (
    <QuizStory
      props={props}
      quiz={{
        kind: 'trivia',
        title: 'Only 1% get 3/3',
        cta: 'Comment your score',
        rounds: [
          {
            question: 'Which planet is the hottest?',
            options: ['Mercury', 'Venus', 'Mars'],
            answer: 1,
            reveal: "It's",
          },
          {
            question: 'How many hearts does an octopus have?',
            options: ['One', 'Two', 'Three'],
            answer: 2,
            reveal: { word: 'Three', nth: 2 },
          },
          {
            question: 'What do bees make besides honey?',
            options: ['Wax', 'Silk', 'Milk'],
            answer: 0,
            reveal: { word: 'Wax', nth: 2 },
          },
        ],
      }}
    />
  );
}
