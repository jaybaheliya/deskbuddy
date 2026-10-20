import React from 'react';
import type { HabitStats } from '../types/deskbuddy';

export interface StatsPanelProps {
  stats: HabitStats;
  focusMinutes: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, focusMinutes }) => {
  const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="stats-section">
      <div className="stats-header">
        <h3>Today's Wellness</h3>
        <span className="subhead-text">Verified completed breaks</span>
      </div>

      <div className="stats-summary-card">
        <div className="summary-item">
          <span className="summary-num">{stats.totalBreaks}</span>
          <span className="summary-label">Breaks Taken</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-num">{formatTime(focusMinutes)}</span>
          <span className="summary-label">Focus Time</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-num">{stats.lastBreakTime || '—'}</span>
          <span className="summary-label">Last Break</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-pill water-pill">
          <span className="stat-icon">💧</span>
          <div className="stat-detail">
            <span className="stat-count">{stats.waterCount}</span>
            <span className="stat-name">Water Logged</span>
          </div>
        </div>

        <div className="stat-pill move-pill">
          <span className="stat-icon">🚶</span>
          <div className="stat-detail">
            <span className="stat-count">{stats.moveCount}</span>
            <span className="stat-name">Walks Taken</span>
          </div>
        </div>

        <div className="stat-pill stretch-pill">
          <span className="stat-icon">🧘‍♂️</span>
          <div className="stat-detail">
            <span className="stat-count">{stats.stretchCount}</span>
            <span className="stat-name">Stretches</span>
          </div>
        </div>

        <div className="stat-pill eyes-pill">
          <span className="stat-icon">👀</span>
          <div className="stat-detail">
            <span className="stat-count">{stats.eyesCount}</span>
            <span className="stat-name">Eye Rests</span>
          </div>
        </div>
      </div>

      <div className="wellness-tip-box">
        <span className="tip-spark">✦</span>
        <p className="tip-text">
          Remember: DeskBuddy only counts habits when you click <strong>Done</strong>. Keep your posture tall and stay hydrated!
        </p>
      </div>
    </div>
  );
};
