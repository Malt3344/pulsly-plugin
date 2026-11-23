import type { VideoProps } from '../kit';
import { ChatStory } from '../styles/chat';

// The finished example of the `chat` style: the messages appear as the voice says them.
export default function ExampleChat(props: VideoProps) {
  return (
    <ChatStory
      props={props}
      chat={{
        contact: { name: 'Jonas', status: 'online' },
        messages: [
          { from: 'them', text: 'Bro why is your shop sold out AGAIN?' },
          { from: 'me', text: 'I posted one video yesterday' },
          { from: 'them', text: 'One video??', reaction: '😳' },
          { from: 'me', text: 'Four thousand orders overnight 📦' },
          { from: 'them', text: 'Okay you have to teach me' },
          { from: 'me', text: "Comment CHAT and I'll send you the exact setup", reaction: '🔥' },
        ],
      }}
    />
  );
}
