import React from 'react';
import type { ActiveReminder } from '../types/deskbuddy';

export interface SpeechBubbleProps {
  message: string;
  activeReminder: ActiveReminder | null;
  onDone?: () => void;
  onSnooze?: (minutes?: number) => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  activeReminder,
  onDone,
  onSnooze,
  onDismiss,
  className = '',
  compact = false
}) => {
  return (
    <div className={`speech-bubble ${activeReminder ? 'has-reminder' : ''} ${compact ? 'compact' : ''} ${className}`}>
      <div className="speech-header">
        <span className="speech-badge">
          {activeReminder ? (
            <>
              <span className="speech-icon">{activeReminder.icon}</span>
              <span className="speech-tag">{activeReminder.title}</span>
            </>
          ) : (
            <>
              <span className="speech-icon">✦</span>
              <span className="speech-tag">WELLNESS COMPANION</span>
            </>
          )}
        </span>
      </div>

      <p className="speech-text">{message}</p>

      {activeReminder && (
        <div className="speech-actions">
          <button
            type="button"
            className="action-btn btn-done"
            onClick={onDone}
            title="Mark as completed"
          >
            ✓ Done
          </button>
          <button
            type="button"
            className="action-btn btn-snooze"
            onClick={() => onSnooze?.(5)}
            title="Remind me again in 5 minutes"
          >
            ⏱ Snooze 5m
          </button>
          <button
            type="button"
            className="action-btn btn-dismiss"
            onClick={onDismiss}
            title="Dismiss for now"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bubble pointer triangle */}
      <div className="bubble-pointer" />
    </div>
  );
};
