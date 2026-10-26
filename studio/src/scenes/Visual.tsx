import type { Visual as VisualSpec } from '../schema';
import { CallToAction } from './CallToAction';
import { Chart } from './Chart';
import { Checklist } from './Checklist';
import { Compare } from './Compare';
import { Notifications } from './Notifications';
import { Quote } from './Quote';
import { Screenshot } from './Screenshot';
import { Stat } from './Stat';
import { Sticker } from './Sticker';
import { Tag } from './Tag';
import { Terminal } from './Terminal';

interface VisualProps {
  spec: VisualSpec;
  accent: string;
  /** Frames into the scene before this visual animates in. */
  delay: number;
}

export function Visual({ spec, accent, delay }: VisualProps) {
  switch (spec.type) {
    case 'tag':
      return <Tag label={spec.label} accent={accent} delay={delay} />;
    case 'terminal':
      return <Terminal spec={spec} accent={accent} delay={delay} />;
    case 'sticker':
      return <Sticker spec={spec} accent={accent} delay={delay} />;
    case 'stat':
      return <Stat spec={spec} accent={accent} delay={delay} />;
    case 'checklist':
      return <Checklist items={spec.items} accent={accent} delay={delay} />;
    case 'cta':
      return <CallToAction spec={spec} accent={accent} delay={delay} />;
    case 'chart':
      return <Chart spec={spec} accent={accent} delay={delay} />;
    case 'compare':
      return <Compare spec={spec} accent={accent} delay={delay} />;
    case 'notifications':
      return <Notifications spec={spec} accent={accent} delay={delay} />;
    case 'image':
      return <Screenshot spec={spec} delay={delay} />;
    case 'quote':
      return <Quote spec={spec} accent={accent} delay={delay} />;
    default:
      return null;
  }
}
