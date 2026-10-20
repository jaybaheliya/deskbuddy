import React, { useEffect, useState } from 'react';
import './App.css';
import { PixarRobot } from './components/PixarRobot';
import { Mascot } from './components/Mascot';
import { SpeechBubble } from './components/SpeechBubble';
import { ReminderPanel } from './components/ReminderPanel';
import { StatsPanel } from './components/StatsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { useReminders } from './hooks/useReminders';
import type { DeskBuddyAction } from './electron';
import type { CharacterModel, MascotState } from './types/deskbuddy';

type TabView = 'companion' | 'habits' | 'stats' | 'settings';

export const App: React.FC = () => {
  const isMascotWindow = window.location.hash === '#mascot';
  const [activeTab, setActiveTab] = useState<TabView>('companion');
  const [mascotDirection, setMascotDirection] = useState<'left' | 'right'>('right');
  const [localMascotState, setLocalMascotState] = useState<MascotState>('idle');
  const [activeCharacter, setActiveCharacter] = useState<CharacterModel>('pixar-robot');
  const [localActiveReminder, setLocalActiveReminder] = useState<any>(null);

  const {
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
  } = useReminders();

  // Keep local mascot state synced
  useEffect(() => {
    setLocalMascotState(mascotState);
  }, [mascotState]);

  useEffect(() => {
    setLocalActiveReminder(activeReminder);
  }, [activeReminder]);

  useEffect(() => {
    setActiveCharacter(settings.characterModel);
  }, [settings.characterModel]);

  // Listen to IPC actions across both windows
  useEffect(() => {
    if (!window.deskBuddy?.onAction) return;

    const cleanup = window.deskBuddy.onAction((action: DeskBuddyAction) => {
      if (action.type === 'reminder:trigger') {
        if (action.payload?.reminder) setLocalActiveReminder(action.payload.reminder);
        if (action.payload?.mascotState) setLocalMascotState(action.payload.mascotState);
        if (action.payload?.character) setActiveCharacter(action.payload.character);
        if (action.payload?.direction) setMascotDirection(action.payload.direction);
      } else if (action.type === 'reminder:clear') {
        setLocalActiveReminder(null);
        setLocalMascotState('idle');
      } else if (action.type === 'reminder:celebrate') {
        setLocalActiveReminder(null);
        setLocalMascotState('celebrating');
        setTimeout(() => setLocalMascotState('idle'), 3500);
      } else if (action.type === 'settings:toggle-pause') {
        if (typeof action.payload?.paused === 'boolean') {
          applyExternalSettings({ paused: action.payload.paused });
        }
      } else if (action.type === 'settings:updated') {
        if (action.payload?.settings) {
          applyExternalSettings(action.payload.settings);
        }
      }
    });

    return () => cleanup();
  }, [applyExternalSettings]);

  // Helper to render Pixar Robot or alternate models
  const renderCharacter = (char: CharacterModel, size = 135) => {
    if (char === 'pixar-robot' || !char) {
      return (
        <PixarRobot
          state={localMascotState}
          direction={mascotDirection}
          size={size}
          onClick={() => window.deskBuddy?.togglePanel()}
        />
      );
    }

    return (
      <Mascot
        state={localMascotState}
        character={char}
        direction={mascotDirection}
        size={size}
        onClick={() => window.deskBuddy?.togglePanel()}
      />
    );
  };

  const handleDone = () => {
    setLocalActiveReminder(null);
    takeBreak();
  };

  const handleSnooze = (minutes = 5) => {
    setLocalActiveReminder(null);
    snooze(minutes);
  };

  const handleDismiss = () => {
    setLocalActiveReminder(null);
    dismiss();
  };

  // -------------------------------------------------------------
  // VIEW 1: DEDICATED DESKTOP ROAMING MASCOT COMPANION (#mascot)
  // -------------------------------------------------------------
  if (isMascotWindow) {
    const currentReminder = localActiveReminder || activeReminder;
    const displayCharacter = currentReminder?.character || activeCharacter;

    return (
      <main className="roaming-mascot-view">
        {/* Floating Speech Bubble: only shown when a reminder is active or triggered */}
        {currentReminder && (
          <div className="roaming-speech-container">
            <SpeechBubble
              compact
              message={currentReminder.message}
              activeReminder={currentReminder}
              onDone={handleDone}
              onSnooze={() => handleSnooze(5)}
              onDismiss={handleDismiss}
            />
          </div>
        )}

        {/* Pixar Mascot Character */}
        <div
          className="roaming-mascot-drag-target"
          onDoubleClick={() => window.deskBuddy?.togglePanel()}
          title="Drag to adjust position | Double-click to open DeskBuddy Panel"
        >
          {renderCharacter(displayCharacter, 140)}
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: DESKBUDDY MAIN CONTROL PANEL (#panel or default)
  // -------------------------------------------------------------
  return (
    <main className="panel-app-container">
      {/* Frameless Drag Titlebar */}
      <header className="window-titlebar">
        <div className="brand-group">
          <span className="brand-spark">✦</span>
          <span className="brand-name">DeskBuddy</span>
          <span className="brand-badge">Robo Companion</span>
        </div>
        <div className="window-controls">
          <button
            type="button"
            className="win-btn"
            onClick={() => window.deskBuddy?.minimize()}
            aria-label="Minimize"
            title="Minimize"
          >
            −
          </button>
          <button
            type="button"
            className="win-btn win-btn-close"
            onClick={() => window.deskBuddy?.close()}
            aria-label="Close to tray"
            title="Close to tray"
          >
            ×
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tab-navigation">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'companion' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('companion')}
        >
          🤖 Companion
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'habits' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          ⏱ Habits
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'stats' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Stats
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'settings' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙ Settings
        </button>
      </nav>

      {/* Tab Panels */}
      <div className="tab-content-area">
        {activeTab === 'companion' && (
          <>
            {/* Visual Stage */}
            <section className="stage-card" style={{ height: 220, overflow: 'hidden' }}>
              <div className="ambient-stars">
                <span>✦</span>
                <span>✧</span>
              </div>
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {renderCharacter(activeCharacter, 140)}
              </div>
            </section>

            {/* Speech Bubble */}
            <SpeechBubble
              message={speechMessage}
              activeReminder={localActiveReminder || activeReminder}
              onDone={handleDone}
              onSnooze={() => handleSnooze(5)}
              onDismiss={handleDismiss}
            />

            {/* Quick Habit Preview & Test Triggers */}
            <div className="quick-test-tray">
              <span className="quick-label">Click to test habits (updates desktop robot instantly):</span>
              <div className="quick-buttons-row">
                <button
                  type="button"
                  className="quick-pill-btn"
                  onClick={() => testReminder('water')}
                >
                  💧 Drink Water
                </button>
                <button
                  type="button"
                  className="quick-pill-btn"
                  onClick={() => testReminder('stretch')}
                >
                  🧘 Stretch
                </button>
                <button
                  type="button"
                  className="quick-pill-btn"
                  onClick={() => testReminder('move')}
                >
                  🚶 Walk
                </button>
                <button
                  type="button"
                  className="quick-pill-btn"
                  onClick={() => testReminder('eyes')}
                >
                  👀 20-20-20
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'habits' && (
          <ReminderPanel
            reminders={settings.reminders}
            paused={settings.paused}
            onTogglePause={togglePause}
            onToggleReminder={toggleReminder}
            onChangeInterval={changeInterval}
            onTestReminder={testReminder}
            nextDueMap={nextDueMap}
          />
        )}

        {activeTab === 'stats' && (
          <StatsPanel stats={stats} focusMinutes={focusMinutes} />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={updateSettings}
            onResetDefaults={resetDefaults}
            onTestVisit={testVisitRoute}
          />
        )}
      </div>

      {/* Footer Info */}
      <footer className="app-footer-bar">
        <span>Last break: {stats.lastBreakTime || 'No breaks yet'}</span>
        <span className={`footer-status ${settings.paused ? 'is-paused' : ''}`}>
          <span className="status-dot">●</span>
          {settings.paused ? 'Paused' : 'Looking after you'}
        </span>
      </footer>
    </main>
  );
};

export default App;
