import type { HabitStats, ReminderConfig, UserSettings } from '../types/deskbuddy';

export const DEFAULT_REMINDERS: ReminderConfig[] = [
  {
    id: 'eyes',
    label: '20-20-20 Eye Rest',
    title: 'Look 20 feet away',
    message: 'Rest your eyes! Look at something 20 feet away for 20 seconds 👀',
    intervalMinutes: 20,
    enabled: true,
    icon: '👀',
    mascotState: 'resting-eyes',
    preferredCharacter: 'human-dev'
  },
  {
    id: 'water',
    label: 'Drink Water',
    title: 'Hydration Check',
    message: 'Time to drink a fresh glass of water! Stay sharp and hydrated 💧',
    intervalMinutes: 30,
    enabled: true,
    icon: '💧',
    mascotState: 'drinking',
    preferredCharacter: 'human-dev'
  },
  {
    id: 'stretch',
    label: 'Stretch Shoulders & Back',
    title: 'Posture & Stretch',
    message: 'Roll your shoulders, reach high, and stretch your spine 🧘‍♂️',
    intervalMinutes: 40,
    enabled: true,
    icon: '🧘‍♂️',
    mascotState: 'stretching',
    preferredCharacter: 'human-coach'
  },
  {
    id: 'move',
    label: 'Stand Up & Walk',
    title: 'Movement Break',
    message: 'Stand up, pace around, or walk for a couple of minutes 🚶',
    intervalMinutes: 45,
    enabled: true,
    icon: '🚶',
    mascotState: 'walking',
    preferredCharacter: 'human-coach'
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  reminders: DEFAULT_REMINDERS,
  paused: false,
  soundEnabled: true,
  desktopWalkingEnabled: true,
  characterModel: 'pixar-robot',
  entryRoute: 'bottom',
  stayDurationSeconds: 20,
  stayOnScreenAlways: true,
  walkSpeed: 2,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  cooldownMinutes: 3,
  reducedMotion: false,
  dockMode: 'floating',
  keepAboveVsCode: true
};

const SETTINGS_KEY = 'deskbuddy_user_settings_v2';
const STATS_KEY = 'deskbuddy_daily_stats_v2';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      reminders: (parsed.reminders && parsed.reminders.length > 0)
        ? parsed.reminders.map((r: ReminderConfig) => {
            const def = DEFAULT_REMINDERS.find((d) => d.id === r.id);
            return def ? { ...def, ...r } : r;
          })
        : DEFAULT_REMINDERS
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // LocalStorage quota or privacy error
  }
}

export function loadTodayStats(): HabitStats {
  const todayKey = getTodayKey();
  const defaultStats: HabitStats = {
    date: todayKey,
    waterCount: 0,
    moveCount: 0,
    stretchCount: 0,
    eyesCount: 0,
    totalBreaks: 0,
    focusMinutes: 0,
    lastBreakTime: null
  };

  try {
    const raw = localStorage.getItem(`${STATS_KEY}_${todayKey}`);
    if (!raw) return defaultStats;
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch {
    return defaultStats;
  }
}

export function saveTodayStats(stats: HabitStats): void {
  try {
    const todayKey = getTodayKey();
    localStorage.setItem(`${STATS_KEY}_${todayKey}`, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function isQuietHourActive(start: string, end: string): boolean {
  if (!start || !end) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}
