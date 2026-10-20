export type ReminderType = 'water' | 'move' | 'stretch' | 'eyes';

export type MascotState =
  | 'idle'
  | 'walking'
  | 'drinking'
  | 'stretching'
  | 'resting-eyes'
  | 'celebrating';

export type CharacterModel = 'pixar-robot' | 'human-dev' | 'human-coach' | 'cyber-mascot';

export type EntryRoute = 'bottom' | 'right' | 'left' | 'top';

export interface ReminderConfig {
  id: ReminderType;
  label: string;
  title: string;
  message: string;
  intervalMinutes: number;
  enabled: boolean;
  icon: string;
  mascotState: MascotState;
  preferredCharacter?: CharacterModel;
}

export interface UserSettings {
  reminders: ReminderConfig[];
  paused: boolean;
  soundEnabled: boolean;
  desktopWalkingEnabled: boolean;
  characterModel: CharacterModel;
  entryRoute: EntryRoute;
  stayDurationSeconds: number; // e.g. 20s
  stayOnScreenAlways: boolean; // if false, enters, stays 20s, and exits
  walkSpeed: number; // 1 to 5
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
  cooldownMinutes: number; // minimum time between notifications
  reducedMotion: boolean;
  dockMode: 'floating' | 'docked';
  keepAboveVsCode: boolean;
}

export interface HabitStats {
  date: string;
  waterCount: number;
  moveCount: number;
  stretchCount: number;
  eyesCount: number;
  totalBreaks: number;
  focusMinutes: number;
  lastBreakTime: string | null;
}

export interface ActiveReminder {
  id: ReminderType;
  title: string;
  message: string;
  icon: string;
  mascotState: MascotState;
  timestamp: number;
  character?: CharacterModel;
  snoozedUntil?: number;
}

export interface WindowPosition {
  x: number;
  y: number;
}
