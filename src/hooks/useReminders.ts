import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ActiveReminder,
  HabitStats,
  MascotState,
  ReminderType,
  UserSettings
} from '../types/deskbuddy';
import {
  DEFAULT_SETTINGS,
  isQuietHourActive,
  loadSettings,
  loadTodayStats,
  saveSettings,
  saveTodayStats
} from '../services/settingsService';
import { reminderService } from '../services/reminderService';
import { soundService } from '../services/soundService';

export function useReminders() {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [stats, setStats] = useState<HabitStats>(() => loadTodayStats());
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [speechMessage, setSpeechMessage] = useState<string>(
    'Hey developer! Ready for a healthy coding session?'
  );
  const [focusMinutes, setFocusMinutes] = useState<number>(0);
  const [nextDueMap, setNextDueMap] = useState<Partial<Record<ReminderType, number>>>({});

  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync settings with Electron
  useEffect(() => {
    saveSettings(settings);
    reminderService.setCooldownMinutes(settings.cooldownMinutes);

    if (window.deskBuddy?.setRoute) {
      window.deskBuddy.setRoute(settings.entryRoute);
    }
    if (window.deskBuddy?.setStayDuration) {
      window.deskBuddy.setStayDuration(settings.stayDurationSeconds);
    }
    if (window.deskBuddy?.setWalking) {
      window.deskBuddy.setWalking(settings.stayOnScreenAlways);
    }
  }, [settings]);

  // Keep stats persisted
  useEffect(() => {
    saveTodayStats(stats);
  }, [stats]);

  // Automated reminder listener
  useEffect(() => {
    const removeListener = reminderService.addListener({
      onTrigger: (reminder) => {
        if (
          settings.quietHoursEnabled &&
          isQuietHourActive(settings.quietHoursStart, settings.quietHoursEnd)
        ) {
          return;
        }

        setActiveReminder(reminder);
        setSpeechMessage(reminder.message);
        setMascotState(reminder.mascotState);

        if (settings.soundEnabled) {
          soundService.playReminderChime();
        }

        // Trigger desktop visit entrance or habit stay
        if (window.deskBuddy?.startVisit) {
          window.deskBuddy.startVisit({
            route: settings.entryRoute,
            staySeconds: settings.stayDurationSeconds,
            habitState: reminder.mascotState,
            character: settings.characterModel,
            reminder,
            message: reminder.message
          });
        }

        // Broadcast to all windows
        if (window.deskBuddy?.sendAction) {
          window.deskBuddy.sendAction({
            type: 'reminder:trigger',
            payload: {
              reminder,
              mascotState: reminder.mascotState,
              character: settings.characterModel,
              message: reminder.message
            }
          });
        }
      },
      onClear: () => {
        setActiveReminder(null);
        setMascotState('idle');
        if (window.deskBuddy?.sendAction) {
          window.deskBuddy.sendAction({ type: 'reminder:clear' });
        }
      }
    });

    return () => removeListener();
  }, [
    settings.quietHoursEnabled,
    settings.quietHoursStart,
    settings.quietHoursEnd,
    settings.soundEnabled,
    settings.characterModel,
    settings.entryRoute,
    settings.stayDurationSeconds
  ]);

  // Schedule or pause reminders when settings change
  useEffect(() => {
    reminderService.setPaused(settings.paused, settings.reminders);
  }, [settings.paused, settings.reminders]);

  // Countdown and Focus Timer Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (settings.paused) return;

      const dueUpdate: Partial<Record<ReminderType, number>> = {};
      settings.reminders.forEach((r) => {
        if (r.enabled) {
          dueUpdate[r.id] = reminderService.getNextDueSeconds(r.id);
        }
      });
      setNextDueMap(dueUpdate);
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.paused, settings.reminders]);

  // Focus time counter
  useEffect(() => {
    const focusInterval = setInterval(() => {
      if (!settings.paused) {
        setFocusMinutes((prev) => prev + 1);
      }
    }, 60000);

    return () => clearInterval(focusInterval);
  }, [settings.paused]);

  // Apply settings received externally from IPC WITHOUT re-broadcasting
  const applyExternalSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Update settings and notify other windows
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      if (window.deskBuddy?.sendAction) {
        window.deskBuddy.sendAction({
          type: 'settings:updated',
          payload: { settings: updated }
        });
      }
      return updated;
    });
  }, []);

  // Toggle single reminder
  const toggleReminder = useCallback((id: ReminderType) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        reminders: prev.reminders.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r
        )
      };
      saveSettings(updated);
      if (window.deskBuddy?.sendAction) {
        window.deskBuddy.sendAction({
          type: 'settings:updated',
          payload: { settings: updated }
        });
      }
      return updated;
    });
  }, []);

  // Change interval
  const changeInterval = useCallback((id: ReminderType, minutes: number) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        reminders: prev.reminders.map((r) =>
          r.id === id ? { ...r, intervalMinutes: minutes } : r
        )
      };
      saveSettings(updated);
      if (window.deskBuddy?.sendAction) {
        window.deskBuddy.sendAction({
          type: 'settings:updated',
          payload: { settings: updated }
        });
      }
      return updated;
    });
  }, []);

  // Toggle global pause
  const togglePause = useCallback(() => {
    setSettings((prev) => {
      const newPaused = !prev.paused;
      if (newPaused) {
        setSpeechMessage('Reminders paused. Take care!');
        setMascotState('idle');
      } else {
        setSpeechMessage('Reminders active! DeskBuddy is looking after you ✨');
      }
      const updated = { ...prev, paused: newPaused };
      saveSettings(updated);
      if (window.deskBuddy?.sendAction) {
        window.deskBuddy.sendAction({
          type: 'settings:toggle-pause',
          payload: { paused: newPaused }
        });
      }
      return updated;
    });
  }, []);

  // User confirmed break as DONE
  const takeBreak = useCallback(() => {
    const nowTimeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const currentActive = activeReminder;

    setStats((prev) => {
      const updated = {
        ...prev,
        totalBreaks: prev.totalBreaks + 1,
        lastBreakTime: nowTimeStr
      };

      if (currentActive?.id === 'water') updated.waterCount += 1;
      else if (currentActive?.id === 'move') updated.moveCount += 1;
      else if (currentActive?.id === 'stretch') updated.stretchCount += 1;
      else if (currentActive?.id === 'eyes') updated.eyesCount += 1;

      return updated;
    });

    if (settings.soundEnabled) {
      soundService.playSuccessChime();
    }

    setActiveReminder(null);
    setMascotState('celebrating');
    setSpeechMessage('Awesome job! Your body thanks you ✨');
    reminderService.clearActiveReminder();

    if (window.deskBuddy?.sendAction) {
      window.deskBuddy.sendAction({
        type: 'reminder:celebrate',
        payload: { message: 'Awesome job! Your body thanks you ✨' }
      });
    }

    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    celebrationTimerRef.current = setTimeout(() => {
      setMascotState('idle');
      setSpeechMessage('Looking after you while you code...');
      setActiveReminder(null);
      if (window.deskBuddy?.sendAction) {
        window.deskBuddy.sendAction({ type: 'reminder:clear' });
      }

      // Exit back along route if not in stay-on-screen-always mode
      if (!settings.stayOnScreenAlways && window.deskBuddy?.exitVisit) {
        window.deskBuddy.exitVisit();
      }
    }, 3200);
  }, [activeReminder, settings.soundEnabled, settings.stayOnScreenAlways]);

  // Snooze
  const snooze = useCallback((minutes = 5) => {
    reminderService.snooze(minutes);
    setMascotState('idle');
    setActiveReminder(null);
    setSpeechMessage(`Snoozed for ${minutes} minutes. Keep up the good work!`);

    if (window.deskBuddy?.sendAction) {
      window.deskBuddy.sendAction({ type: 'reminder:clear' });
    }

    if (!settings.stayOnScreenAlways && window.deskBuddy?.exitVisit) {
      window.deskBuddy.exitVisit();
    }
  }, [settings.stayOnScreenAlways]);

  // Dismiss
  const dismiss = useCallback(() => {
    reminderService.dismiss();
    setMascotState('idle');
    setActiveReminder(null);
    setSpeechMessage('Reminder dismissed. DeskBuddy is still watching out for you!');

    if (window.deskBuddy?.sendAction) {
      window.deskBuddy.sendAction({ type: 'reminder:clear' });
    }

    if (!settings.stayOnScreenAlways && window.deskBuddy?.exitVisit) {
      window.deskBuddy.exitVisit();
    }
  }, [settings.stayOnScreenAlways]);

  // Test / preview a reminder - SMOOTH VISIT ENTRANCE & HABIT ANIMATION
  const testReminder = useCallback((id: ReminderType) => {
    const config = settings.reminders.find((r) => r.id === id);
    if (!config) return;

    const testActive: ActiveReminder = {
      id: config.id,
      title: config.title,
      message: config.message,
      icon: config.icon,
      mascotState: config.mascotState,
      timestamp: Date.now(),
      character: config.preferredCharacter || settings.characterModel
    };

    setActiveReminder(testActive);
    setSpeechMessage(config.message);
    setMascotState(config.mascotState);

    if (settings.soundEnabled) {
      soundService.playReminderChime();
    }

    // Trigger desktop visit entrance or immediate habit
    if (window.deskBuddy?.startVisit) {
      window.deskBuddy.startVisit({
        route: settings.entryRoute,
        staySeconds: settings.stayDurationSeconds,
        habitState: config.mascotState,
        character: config.preferredCharacter || settings.characterModel,
        reminder: testActive,
        message: config.message
      });
    }

    // Broadcast to mascot window
    if (window.deskBuddy?.sendAction) {
      window.deskBuddy.sendAction({
        type: 'reminder:trigger',
        payload: {
          reminder: testActive,
          mascotState: config.mascotState,
          character: config.preferredCharacter || settings.characterModel,
          message: config.message,
          staySeconds: settings.stayDurationSeconds
        }
      });
    }
  }, [settings.reminders, settings.soundEnabled, settings.characterModel, settings.entryRoute, settings.stayDurationSeconds]);

  // Test visit route directly
  const testVisitRoute = useCallback(() => {
    testReminder('water');
  }, [testReminder]);

  // Reset all to defaults
  const resetDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setSpeechMessage('Settings restored to defaults.');
    if (window.deskBuddy?.sendAction) {
      window.deskBuddy.sendAction({
        type: 'settings:updated',
        payload: { settings: DEFAULT_SETTINGS }
      });
    }
  }, []);

  return {
    settings,
    stats,
    activeReminder,
    mascotState,
    speechMessage,
    focusMinutes,
    nextDueMap,
    toggleReminder,
    changeInterval,
    togglePause,
    takeBreak,
    snooze,
    dismiss,
    testReminder,
    testVisitRoute,
    applyExternalSettings,
    updateSettings,
    resetDefaults
  };
}
