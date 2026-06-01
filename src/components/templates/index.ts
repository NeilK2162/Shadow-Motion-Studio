import type { TemplateId } from '@/types';
import { ChapterCard } from './ChapterCard/ChapterCard';
import { CheatCode } from './CheatCode/CheatCode';
import { EnterLocation } from './EnterLocation/EnterLocation';
import { LoadingScreen } from './LoadingScreen/LoadingScreen';
import { MissionFailed } from './MissionFailed/MissionFailed';
import { MissionPassed } from './MissionPassed/MissionPassed';
import { PhoneCall } from './PhoneCall/PhoneCall';
import { SideQuest } from './SideQuest/SideQuest';
import { WeeklyStats } from './WeeklyStats/WeeklyStats';
import type { TemplateComponentProps } from './shared/types';

export const TEMPLATE_COMPONENTS: Record<TemplateId, React.ComponentType<TemplateComponentProps>> = {
  'mission-passed': MissionPassed,
  'mission-failed': MissionFailed,
  'chapter-card': ChapterCard,
  'loading-screen': LoadingScreen,
  'side-quest': SideQuest,
  'enter-location': EnterLocation,
  'phone-call': PhoneCall,
  'cheat-code': CheatCode,
  'weekly-stats': WeeklyStats,
};

export {
  MissionPassed,
  MissionFailed,
  ChapterCard,
  LoadingScreen,
  SideQuest,
  EnterLocation,
  PhoneCall,
  CheatCode,
  WeeklyStats,
};
