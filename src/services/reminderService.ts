import type { ActiveReminder, ReminderConfig, ReminderType } from '../types/deskbuddy';

export interface ReminderListener {
  onTrigger: (reminder: ActiveReminder) => void;
  onClear: () => void;
}

export class ReminderService {
  private timers: Map<ReminderType, ReturnType<typeof setTimeout>> = new Map();
  private nextDue: Map<ReminderType, number> = new Map();
  private activeReminder: ActiveReminder | null = null;
  private lastTriggerTime = 0;
  private listeners: Set<ReminderListener> = new Set();
  private isPaused = false;
  private cooldownMs = 3 * 60 * 1000; // default 3 min cooldown

  constructor() {
    // Graceful sleep/wake handling in browser/Electron
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.handleSystemWake());
    }
  }

  addListener(listener: ReminderListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setPaused(paused: boolean, reminders: ReminderConfig[]): void {
    this.isPaused = paused;
    if (paused) {
      this.clearAllTimers();
      this.clearActiveReminder();
    } else {
      this.scheduleReminders(reminders);
    }
  }

  setCooldownMinutes(minutes: number): void {
    this.cooldownMs = Math.max(1, minutes) * 60 * 1000;
  }

  /**
   * Resets and starts timers for all enabled reminders.
   * Prevents duplicate timers and handles changes in intervals safely.
   */
  scheduleReminders(reminders: ReminderConfig[]): void {
    this.clearAllTimers();

    if (this.isPaused) return;

    const now = Date.now();

    reminders.forEach((config) => {
      if (!config.enabled) {
        this.nextDue.delete(config.id);
        return;
      }

      const intervalMs = Math.max(1, config.intervalMinutes) * 60 * 1000;
      const targetTime = now + intervalMs;
      this.nextDue.set(config.id, targetTime);

      this.scheduleTimer(config, intervalMs);
    });
  }

  private scheduleTimer(config: ReminderConfig, delayMs: number): void {
    // Clear existing timer if any
    const existing = this.timers.get(config.id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.handleReminderFired(config);
    }, delayMs);

    this.timers.set(config.id, timer);
  }

  private handleReminderFired(config: ReminderConfig): void {
    if (this.isPaused) return;

    const now = Date.now();

    // Enforce cooldown so we don't bombard the user if another reminder just fired
    if (now - this.lastTriggerTime < this.cooldownMs && this.activeReminder) {
      // Re-schedule this reminder for when cooldown expires
      const delay = this.cooldownMs - (now - this.lastTriggerTime) + 1000;
      this.scheduleTimer(config, delay);
      return;
    }

    const reminder: ActiveReminder = {
      id: config.id,
      title: config.title,
      message: config.message,
      icon: config.icon,
      mascotState: config.mascotState,
      timestamp: now
    };

    this.activeReminder = reminder;
    this.lastTriggerTime = now;

    // Reschedule next regular occurrence
    const nextIntervalMs = Math.max(1, config.intervalMinutes) * 60 * 1000;
    this.nextDue.set(config.id, now + nextIntervalMs);
    this.scheduleTimer(config, nextIntervalMs);

    // Notify listeners
    this.listeners.forEach((l) => l.onTrigger(reminder));
  }

  /**
   * Snooze active reminder by X minutes (default 5 min).
   */
  snooze(minutes = 5): void {
    if (!this.activeReminder) return;
    const reminderId = this.activeReminder.id;
    this.clearActiveReminder();

    const snoozeMs = minutes * 60 * 1000;
    const existing = this.timers.get(reminderId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      // Re-trigger reminder
      this.listeners.forEach((l) => {
        if (this.activeReminder) l.onTrigger(this.activeReminder);
      });
    }, snoozeMs);

    this.timers.set(reminderId, timer);
  }

  /**
   * Dismiss the active reminder popup without counting as done.
   */
  dismiss(): void {
    this.clearActiveReminder();
  }

  /**
   * Clear active reminder.
   */
  clearActiveReminder(): void {
    this.activeReminder = null;
    this.listeners.forEach((l) => l.onClear());
  }

  getActiveReminder(): ActiveReminder | null {
    return this.activeReminder;
  }

  getNextDueSeconds(id: ReminderType): number {
    const due = this.nextDue.get(id);
    if (!due) return 0;
    const remaining = Math.max(0, Math.floor((due - Date.now()) / 1000));
    return remaining;
  }

  /**
   * Called when system resumes from sleep or app reactivates.
   * Prevents a burst of missed notifications.
   */
  handleSystemWake(): void {
    const now = Date.now();
    // If a reminder's targetTime passed more than 5 minutes ago while asleep,
    // push its next due forward rather than firing all simultaneously
    this.nextDue.forEach((dueTime, id) => {
      if (dueTime < now) {
        // Reset to now + normal interval
        this.nextDue.set(id, now + 60 * 1000);
      }
    });
  }

  clearAllTimers(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
  }
}

export const reminderService = new ReminderService();
