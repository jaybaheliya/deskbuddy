import React from 'react';
import type { ReminderConfig, ReminderType } from '../types/deskbuddy';

export interface ReminderPanelProps {
  reminders: ReminderConfig[];
  paused: boolean;
  onTogglePause: () => void;
  onToggleReminder: (id: ReminderType) => void;
  onChangeInterval: (id: ReminderType, minutes: number) => void;
  onTestReminder?: (id: ReminderType) => void;
  nextDueMap?: Partial<Record<ReminderType, number>>;
}

export const ReminderPanel: React.FC<ReminderPanelProps> = ({
  reminders,
  paused,
  onTogglePause,
  onToggleReminder,
  onChangeInterval,
  onTestReminder,
  nextDueMap = {}
}) => {
  const formatSeconds = (sec?: number): string => {
    if (sec === undefined || sec <= 0) return 'ready';
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    if (mins === 0) return `${s}s`;
    return `${mins}m ${s > 0 ? `${s}s` : ''}`;
  };

  return (
    <div className="reminders-section">
      <div className="reminders-header">
        <div className="header-title-group">
          <h3>Healthy Habits</h3>
          <span className="subhead-text">Automatic wellness checks</span>
        </div>
        <button
          type="button"
          className={`pause-pill-btn ${paused ? 'is-paused' : ''}`}
          onClick={onTogglePause}
          title={paused ? 'Resume all health reminders' : 'Pause all health reminders'}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      <div className="reminders-list">
        {reminders.map((reminder) => {
          const nextSec = nextDueMap[reminder.id];
          return (
            <div
              key={reminder.id}
              className={`reminder-card ${reminder.enabled ? 'active' : 'disabled'}`}
            >
              <div className="reminder-main-row">
                <span className="reminder-icon-badge">{reminder.icon}</span>

                <div className="reminder-info">
                  <div className="reminder-title-line">
                    <span className="reminder-name">{reminder.label}</span>
                    {reminder.enabled && !paused && nextSec !== undefined && (
                      <span className="reminder-countdown">
                        ⏱ {formatSeconds(nextSec)}
                      </span>
                    )}
                  </div>
                  <div className="reminder-interval-editor">
                    <span className="interval-label">Every</span>
                    <select
                      className="interval-select"
                      value={reminder.intervalMinutes}
                      disabled={!reminder.enabled}
                      onChange={(e) =>
                        onChangeInterval(reminder.id, Number(e.target.value))
                      }
                      title="Adjust reminder interval"
                    >
                      <option value={10}>10 min</option>
                      <option value={15}>15 min</option>
                      <option value={20}>20 min (20-20-20 rule)</option>
                      <option value={25}>25 min (Pomodoro)</option>
                      <option value={30}>30 min</option>
                      <option value={40}>40 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min (1 hr)</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>
                </div>

                <div className="reminder-actions-col">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={() => onToggleReminder(reminder.id)}
                      aria-label={`Toggle ${reminder.label}`}
                    />
                    <span className="toggle-slider" />
                  </label>

                  {onTestReminder && (
                    <button
                      type="button"
                      className="test-ping-btn"
                      onClick={() => onTestReminder(reminder.id)}
                      title={`Preview ${reminder.label} animation`}
                    >
                      Test
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
