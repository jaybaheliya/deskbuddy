import React, { useState } from 'react';
import type { CharacterModel, EntryRoute, UserSettings } from '../types/deskbuddy';

export interface SettingsPanelProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetDefaults: () => void;
  onTestVisit?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults,
  onTestVisit
}) => {
  const [assetStatus, setAssetStatus] = useState<string | null>(null);

  const handleFileUpload = (habitKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        localStorage.setItem(`deskbuddy_asset_${habitKey}`, base64);
        setAssetStatus(`Updated custom animation for ${habitKey}!`);
        setTimeout(() => setAssetStatus(null), 3000);
        // Force refresh
        window.location.reload();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearCustomAssets = () => {
    const keys = ['drink', 'walk', 'stretch', 'idle', 'eyes', 'celebrate'];
    keys.forEach((k) => localStorage.removeItem(`deskbuddy_asset_${k}`));
    setAssetStatus('Reverted to built-in vector animations.');
    setTimeout(() => {
      setAssetStatus(null);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h3>Settings & Preferences</h3>
        <span className="subhead-text">Customize your companion</span>
      </div>

      {/* CHARACTER & APPEARANCE */}
      <div className="settings-group">
        <h4 className="group-title">Character & Appearance</h4>

        <div className="setting-row">
          <div className="setting-label-col">
            <span className="setting-title">Companion Model</span>
            <span className="setting-desc">Built-in character model</span>
          </div>
          <select
            className="setting-select"
            value={settings.characterModel}
            onChange={(e) =>
              onUpdateSettings({ characterModel: e.target.value as CharacterModel })
            }
          >
            <option value="pixar-robot">✦ Pixar RoboBuddy (3D-Shaded & Optimized)</option>
            <option value="human-dev">Alex — Developer (Human)</option>
            <option value="human-coach">Maya — Wellness Coach (Human)</option>
            <option value="cyber-mascot">CyberBuddy (Half-Human/Half-Robot)</option>
          </select>
        </div>
      </div>

      {/* CUSTOM ANIMATION FILES LOADER */}
      <div className="settings-group">
        <h4 className="group-title">Custom Real Character Animations</h4>
        <span className="setting-desc" style={{ marginBottom: '6px' }}>
          Upload your own transparent GIF, WebP, or PNG animations for each habit, or place them in <code>public/mascot/</code>.
        </span>

        {assetStatus && (
          <div style={{ padding: '6px 10px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: '8px', color: '#7dd3fc', fontSize: '11px' }}>
            {assetStatus}
          </div>
        )}

        <div className="setting-row">
          <span className="setting-title">💧 Drinking Water (drink.gif)</span>
          <input
            type="file"
            accept="image/gif,image/webp,image/png"
            style={{ fontSize: '10px', maxWidth: '140px' }}
            onChange={(e) => handleFileUpload('drink', e)}
          />
        </div>

        <div className="setting-row">
          <span className="setting-title">🚶 Walking (walk.gif)</span>
          <input
            type="file"
            accept="image/gif,image/webp,image/png"
            style={{ fontSize: '10px', maxWidth: '140px' }}
            onChange={(e) => handleFileUpload('walk', e)}
          />
        </div>

        <div className="setting-row">
          <span className="setting-title">🧘 Stretching (stretch.gif)</span>
          <input
            type="file"
            accept="image/gif,image/webp,image/png"
            style={{ fontSize: '10px', maxWidth: '140px' }}
            onChange={(e) => handleFileUpload('stretch', e)}
          />
        </div>

        <div className="setting-row">
          <span className="setting-title">✦ Idle / Breathing (idle.gif)</span>
          <input
            type="file"
            accept="image/gif,image/webp,image/png"
            style={{ fontSize: '10px', maxWidth: '140px' }}
            onChange={(e) => handleFileUpload('idle', e)}
          />
        </div>

        <div className="setting-row">
          <span className="setting-title">👀 Resting Eyes (eyes.gif)</span>
          <input
            type="file"
            accept="image/gif,image/webp,image/png"
            style={{ fontSize: '10px', maxWidth: '140px' }}
            onChange={(e) => handleFileUpload('eyes', e)}
          />
        </div>

        <button
          type="button"
          className="test-ping-btn"
          style={{ marginTop: '4px', alignSelf: 'flex-start', padding: '4px 8px' }}
          onClick={handleClearCustomAssets}
        >
          Reset to Built-in Animations
        </button>
      </div>

      {/* DESKTOP ROUTE & WALKING BEHAVIOR */}
      <div className="settings-group">
        <h4 className="group-title">Desktop Walking & Route</h4>

        <div className="setting-row">
          <div className="setting-label-col">
            <span className="setting-title">Entrance Route</span>
            <span className="setting-desc">Direction character walks into screen</span>
          </div>
          <select
            className="setting-select"
            value={settings.entryRoute}
            onChange={(e) =>
              onUpdateSettings({ entryRoute: e.target.value as EntryRoute })
            }
          >
            <option value="bottom">Bottom (Rises from taskbar)</option>
            <option value="right">Right (Walks from right edge)</option>
            <option value="left">Left (Walks from left edge)</option>
            <option value="top">Top (Steps from top edge)</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-label-col">
            <span className="setting-title">Stay Duration</span>
            <span className="setting-desc">Time on screen before exiting</span>
          </div>
          <select
            className="setting-select"
            value={settings.stayDurationSeconds}
            onChange={(e) =>
              onUpdateSettings({ stayDurationSeconds: Number(e.target.value) })
            }
          >
            <option value={15}>15 seconds</option>
            <option value={20}>20 seconds (Default)</option>
            <option value={30}>30 seconds</option>
            <option value={45}>45 seconds</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-label-col">
            <span className="setting-title">Stay On Screen Always</span>
            <span className="setting-desc">Keep visible on screen continuously</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.stayOnScreenAlways}
              onChange={(e) =>
                onUpdateSettings({ stayOnScreenAlways: e.target.checked })
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-label-col">
            <span className="setting-title">Keep Above Other Windows</span>
            <span className="setting-desc">Floats above VS Code and browser</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.keepAboveVsCode}
              onChange={(e) =>
                onUpdateSettings({ keepAboveVsCode: e.target.checked })
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {onTestVisit && (
          <div className="setting-row">
            <button
              type="button"
              className="action-btn btn-done"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onTestVisit}
            >
              ✦ Test Walking Visit (Enter & Exit)
            </button>
          </div>
        )}
      </div>

      {/* AUDIO & QUIET HOURS */}
      <div className="settings-group">
        <h4 className="group-title">Notifications & Audio</h4>

        <div className="setting-row">
          <div className="setting-label-col">
            <span className="setting-title">Sound Chimes</span>
            <span className="setting-desc">Gentle bell when companion arrives</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) =>
                onUpdateSettings({ soundEnabled: e.target.checked })
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-label-col">
            <span className="setting-title">Quiet Hours</span>
            <span className="setting-desc">Pause companion visits at night</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.quietHoursEnabled}
              onChange={(e) =>
                onUpdateSettings({ quietHoursEnabled: e.target.checked })
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {settings.quietHoursEnabled && (
          <div className="setting-row sub-row">
            <div className="time-range-picker">
              <span>From</span>
              <input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) =>
                  onUpdateSettings({ quietHoursStart: e.target.value })
                }
              />
              <span>To</span>
              <input
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) =>
                  onUpdateSettings({ quietHoursEnd: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* ACCESSIBILITY */}
      <div className="settings-group">
        <h4 className="group-title">Accessibility</h4>

        <div className="setting-row">
          <div className="setting-label-col">
            <span className="setting-title">Reduce Motion</span>
            <span className="setting-desc">Minimize character animations</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) =>
                onUpdateSettings({ reducedMotion: e.target.checked })
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="settings-footer">
        <button
          type="button"
          className="reset-defaults-btn"
          onClick={onResetDefaults}
        >
          Reset All Defaults
        </button>
      </div>
    </div>
  );
};
