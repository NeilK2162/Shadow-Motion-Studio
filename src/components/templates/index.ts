import type { TemplateId } from '@/types';
import { ChapterCard } from './ChapterCard/ChapterCard';
import { CharacterIntro } from './CharacterIntro/CharacterIntro';
import { CashPickup } from './CashPickup/CashPickup';
import { CheatCode } from './CheatCode/CheatCode';
import { Countdown } from './Countdown/Countdown';
import { EnterLocation } from './EnterLocation/EnterLocation';
import { GpsRoute } from './GpsRoute/GpsRoute';
import { LoadingScreen } from './LoadingScreen/LoadingScreen';
import { MissionFailed } from './MissionFailed/MissionFailed';
import { MissionPassed } from './MissionPassed/MissionPassed';
import { NowPlaying } from './NowPlaying/NowPlaying';
import { PhoneCall } from './PhoneCall/PhoneCall';
import { SideQuest } from './SideQuest/SideQuest';
import { StatusHud } from './StatusHud/StatusHud';
import { SubscribePrompt } from './SubscribePrompt/SubscribePrompt';
import { ThisOrThat } from './ThisOrThat/ThisOrThat';
import { WantedLevel } from './WantedLevel/WantedLevel';
import { Wasted } from './Wasted/Wasted';
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
  'wanted-level': WantedLevel,
  'cash-pickup': CashPickup,
  'status-hud': StatusHud,
  'gps-route': GpsRoute,
  'character-intro': CharacterIntro,
  'now-playing': NowPlaying,
  'wasted': Wasted,
  'subscribe-prompt': SubscribePrompt,
  'countdown': Countdown,
  'this-or-that': ThisOrThat,
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
  WantedLevel,
  CashPickup,
  StatusHud,
  GpsRoute,
  CharacterIntro,
  NowPlaying,
  Wasted,
  SubscribePrompt,
  Countdown,
  ThisOrThat,
};
