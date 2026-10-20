import React, { useEffect, useState } from 'react';
import type { CharacterModel, MascotState } from '../types/deskbuddy';

export interface MascotProps {
  state?: MascotState;
  character?: CharacterModel;
  size?: number;
  direction?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  showBottle?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({
  state = 'idle',
  character = 'human-dev',
  size = 140,
  direction = 'right',
  className = '',
  onClick,
  showBottle = false
}) => {
  const [customAssetUrl, setCustomAssetUrl] = useState<string | null>(null);
  const [customLoadFailed, setCustomLoadFailed] = useState(false);

  // Map state to asset name
  const assetNameMap: Record<MascotState, string> = {
    idle: 'idle',
    walking: 'walk',
    drinking: 'drink',
    stretching: 'stretch',
    'resting-eyes': 'eyes',
    celebrating: 'celebrate'
  };

  const assetKey = assetNameMap[state] || 'idle';

  // Check for custom assets in localStorage or public/mascot/
  useEffect(() => {
    setCustomLoadFailed(false);

    // 1. Check custom uploaded asset from localStorage
    try {
      const stored = localStorage.getItem(`deskbuddy_asset_${assetKey}`);
      if (stored) {
        setCustomAssetUrl(stored);
        return;
      }
    } catch {}

    // 2. Try file from public/mascot/{assetKey}.gif (or webp)
    // We attempt to load it; if it fails (404), onError will switch back to SVG
    setCustomAssetUrl(`./mascot/${assetKey}.gif`);
  }, [assetKey]);

  // If a custom GIF/WebP asset successfully loads, display it!
  if (customAssetUrl && !customLoadFailed) {
    return (
      <div
        className={`mascot-root state-${state} dir-${direction} ${className}`}
        style={{
          width: size,
          height: size * 1.3,
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onClick={onClick}
        role="img"
        aria-label={`${character} mascot in ${state} state`}
      >
        <div className={`mascot-flip-wrapper ${direction === 'left' ? 'flip-horizontal' : ''}`}>
          <img
            src={customAssetUrl}
            alt={`Mascot ${state}`}
            onError={() => {
              // If .gif not found in public/mascot, try .webp before falling back
              if (customAssetUrl.endsWith('.gif')) {
                setCustomAssetUrl(`./mascot/${assetKey}.webp`);
              } else if (customAssetUrl.endsWith('.webp')) {
                setCustomAssetUrl(`./mascot/${assetKey}.png`);
              } else {
                setCustomLoadFailed(true);
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>
    );
  }

  // Built-in character rendering
  const isWalking = state === 'walking';
  const isDrinking = state === 'drinking';
  const isStretching = state === 'stretching';
  const isRestingEyes = state === 'resting-eyes';
  const isCelebrating = state === 'celebrating';
  const shouldShowBottle = isDrinking || showBottle;

  const isCyber = character === 'cyber-mascot';
  const isCoach = character === 'human-coach';

  return (
    <div
      className={`mascot-root char-${character} state-${state} dir-${direction} ${className}`}
      style={{
        width: size,
        height: size * 1.3,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
      role="img"
      aria-label={`${character} mascot in ${state} state`}
    >
      <div className={`mascot-flip-wrapper ${direction === 'left' ? 'flip-horizontal' : ''}`}>
        <svg
          viewBox="0 0 180 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mascot-svg-el"
        >
          <defs>
            <linearGradient id="skinToneGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isCoach ? '#fcd5b8' : '#fed7aa'} />
              <stop offset="50%" stopColor={isCoach ? '#f3b893' : '#fba779'} />
              <stop offset="100%" stopColor={isCoach ? '#dc9065' : '#e08351'} />
            </linearGradient>

            <linearGradient id="hoodieGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#034b75" />
            </linearGradient>

            <linearGradient id="coachJacketGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="60%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>

            <linearGradient id="cyberMetalGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4da0c0" />
              <stop offset="60%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#0f1d33" />
            </linearGradient>

            <linearGradient id="jeansGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isCoach ? '#78350f' : '#292524'} />
              <stop offset="100%" stopColor={isCoach ? '#451a03' : '#1c1917'} />
            </linearGradient>

            <linearGradient id="bottleFlaskGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="40%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            <radialGradient id="cyberCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>

            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="realDropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#020617" floodOpacity="0.45" />
            </filter>

            <clipPath id="cyberLeftClip">
              <rect x="0" y="0" width="90" height="220" />
            </clipPath>
            <clipPath id="cyberRightClip">
              <rect x="90" y="0" width="90" height="220" />
            </clipPath>
          </defs>

          {/* Ground Contact Shadow */}
          <ellipse
            cx="90"
            cy="204"
            rx={isWalking ? 42 : isCelebrating ? 34 : 48}
            ry="7.5"
            fill="#020617"
            opacity="0.38"
            className="mascot-ground-ellipse"
          />

          {/* SKELETON RIG */}
          <g className={`mascot-rig ${isWalking ? 'rig-walking' : ''} ${isCelebrating ? 'rig-celebrating' : ''}`}>

            {/* 1. LEGS & SNEAKERS */}
            <g className="rig-legs">
              <g className={`rig-leg leg-left ${isWalking ? 'anim-walk-leg-left' : ''}`}>
                <path d="M62 152 L60 186 C60 189, 74 189, 74 186 L76 152 Z" fill="url(#jeansGrad)" />
                <path d="M54 186 C54 182, 78 182, 78 186 L79 194 C79 198, 52 198, 52 194 Z" fill="#ffffff" />
                <rect x="52" y="192" width="27" height="4" rx="2" fill={isCoach ? '#f43f5e' : '#38bdf8'} />
                <line x1="62" y1="187" x2="70" y2="187" stroke="#94a3b8" strokeWidth="1.2" />
              </g>

              <g className={`rig-leg leg-right ${isWalking ? 'anim-walk-leg-right' : ''}`}>
                <path d="M104 152 L102 186 C102 189, 116 189, 116 186 L118 152 Z" fill="url(#jeansGrad)" />
                <path d="M98 186 C98 182, 122 182, 122 186 L124 194 C124 198, 96 198, 96 194 Z" fill="#ffffff" />
                <rect x="97" y="192" width="27" height="4" rx="2" fill={isCoach ? '#f43f5e' : '#38bdf8'} />
                <line x1="106" y1="187" x2="114" y2="187" stroke="#94a3b8" strokeWidth="1.2" />
              </g>
            </g>

            {/* 2. TORSO & CLOTHING */}
            <g className="rig-torso" filter="url(#realDropShadow)">
              <rect x="81" y="98" width="18" height="15" rx="7" fill="url(#skinToneGrad)" />

              {isCyber ? (
                <rect x="50" y="108" width="80" height="52" rx="18" fill="url(#cyberMetalGrad)" stroke="#38bdf8" strokeWidth="2" />
              ) : isCoach ? (
                <rect x="50" y="108" width="80" height="52" rx="18" fill="url(#coachJacketGrad)" stroke="#fda4af" strokeWidth="1.5" />
              ) : (
                <rect x="50" y="108" width="80" height="52" rx="18" fill="url(#hoodieGrad)" stroke="#7dd3fc" strokeWidth="1.5" />
              )}

              {!isCyber ? (
                <>
                  <line x1="90" y1="108" x2="90" y2="160" stroke="#f8fafc" strokeWidth="2" strokeDasharray="3 2" opacity="0.75" />
                  <line x1="84" y1="114" x2="84" y2="132" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="96" y1="114" x2="96" y2="132" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="84" cy="133" r="1.5" fill="#38bdf8" />
                  <circle cx="96" cy="133" r="1.5" fill="#38bdf8" />
                </>
              ) : (
                <>
                  <line x1="90" y1="108" x2="90" y2="160" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 2" />
                  <circle cx="90" cy="134" r="10" fill="url(#cyberCoreGlow)" filter="url(#softGlow)" />
                  <circle cx="90" cy="134" r="4" fill="#ffffff" />
                </>
              )}
            </g>

            {/* 3. ARMS, HANDS & WATER BOTTLE */}
            <g className="rig-arms">
              <g className={`rig-arm arm-left ${isWalking ? 'anim-walk-arm-left' : ''} ${isStretching ? 'anim-stretch-arm-left' : ''}`}>
                <path
                  d="M32 110 C32 110, 30 148, 38 152 C44 154, 48 150, 48 144 L48 110 Z"
                  fill={isCyber ? 'url(#cyberMetalGrad)' : isCoach ? 'url(#coachJacketGrad)' : 'url(#hoodieGrad)'}
                />
                <circle cx="40" cy="154" r="7.5" fill="url(#skinToneGrad)" />
              </g>

              <g className={`rig-arm arm-right ${isWalking ? 'anim-walk-arm-right' : ''} ${isDrinking ? 'anim-drinking-arm' : ''} ${isStretching ? 'anim-stretch-arm-right' : ''}`}>
                <path
                  d="M132 110 C132 110, 134 148, 142 152 C148 154, 150 148, 148 144 L148 110 Z"
                  fill={isCyber ? 'url(#cyberMetalGrad)' : isCoach ? 'url(#coachJacketGrad)' : 'url(#hoodieGrad)'}
                />
                <circle cx="140" cy="154" r="7.5" fill="url(#skinToneGrad)" />

                {/* REALISTIC HYDRATION WATER BOTTLE IN HAND */}
                {shouldShowBottle && (
                  <g className={`rig-water-bottle ${isDrinking ? 'bottle-drinking' : 'bottle-holding'}`} transform="translate(130, 126)">
                    <path d="M6 -10 C6 -13, 14 -13, 14 -10 L14 -6 L6 -6 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.2" />
                    <rect x="4" y="-6" width="12" height="5" rx="1.5" fill="#334155" />
                    <path d="M10 -6 L10 -15 L4 -18" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="0" y="-1" width="20" height="34" rx="6" fill="url(#bottleFlaskGrad)" stroke="#ffffff" strokeWidth="1.5" />
                    <rect x="2" y="10" width="16" height="21" rx="4" fill="url(#liquidGrad)" />
                    <path d="M2 11 Q10 8 18 11" stroke="#bae6fd" strokeWidth="1.5" fill="none" />
                    <line x1="3" y1="16" x2="6" y2="16" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                    <line x1="3" y1="21" x2="8" y2="21" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
                    <line x1="3" y1="26" x2="6" y2="26" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                    <path d="M13 18 C13 16, 11 14, 11 14 C11 14, 9 16, 9 18 C9 19.5, 10 20.5, 11 20.5 C12 20.5, 13 19.5, 13 18 Z" fill="#ffffff" opacity="0.9" />
                  </g>
                )}
              </g>
            </g>

            {/* 4. HEAD & EXPRESSION */}
            <g className={`rig-head ${isDrinking ? 'anim-drink-head' : ''}`} filter="url(#realDropShadow)">
              {isCyber ? (
                <>
                  <g clipPath="url(#cyberLeftClip)">
                    <rect x="42" y="30" width="96" height="76" rx="38" fill="url(#skinToneGrad)" />
                    {isRestingEyes ? (
                      <path d="M56 64 Q63 70 70 64" stroke="#2e1b12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    ) : (
                      <g className="anim-human-blink">
                        <ellipse cx="63" cy="62" rx="7" ry="8" fill="#ffffff" />
                        <ellipse cx="63.5" cy="62.5" rx="5" ry="5.5" fill="#2d1c16" />
                        <circle cx="65.5" cy="60" r="2" fill="#ffffff" />
                        <circle cx="61.5" cy="64.5" r="1" fill="#ffffff" opacity="0.8" />
                        <path d="M55 52 Q63 48 71 52" stroke="#231815" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      </g>
                    )}
                    <circle cx="53" cy="73" r="6" fill="#f87171" opacity="0.35" />
                    <path d="M68 80 Q79 86 88 86" stroke="#682c1e" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  </g>

                  <g clipPath="url(#cyberRightClip)">
                    <rect x="42" y="30" width="96" height="76" rx="38" fill="url(#cyberMetalGrad)" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="134" cy="64" r="6" fill="#0f2638" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="134" cy="64" r="2.5" fill="#00f2fe" filter="url(#softGlow)" />
                    {isRestingEyes ? (
                      <line x1="104" y1="63" x2="118" y2="63" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#softGlow)" opacity="0.7" />
                    ) : (
                      <g className="anim-robot-eye-pulse">
                        <circle cx="111" cy="62" r="10" fill="#0b2438" stroke="#38bdf8" strokeWidth="1.5" />
                        <circle cx="111" cy="62" r="7" fill="url(#cyberCoreGlow)" filter="url(#softGlow)" />
                        <circle cx="111" cy="62" r="2.8" fill="#ffffff" />
                      </g>
                    )}
                    <path d="M90 86 Q98 86 109 82" stroke="#00f2fe" strokeWidth="2.8" strokeLinecap="round" fill="none" filter="url(#softGlow)" />
                  </g>

                  <line x1="90" y1="30" x2="90" y2="106" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" filter="url(#softGlow)" />
                </>
              ) : (
                <g>
                  <rect
                    x="44"
                    y="30"
                    width="92"
                    height="76"
                    rx="38"
                    fill="url(#skinToneGrad)"
                    stroke={isCoach ? '#f3b893' : '#fba779'}
                    strokeWidth="1.5"
                  />

                  {isRestingEyes ? (
                    <g>
                      <path d="M58 64 Q66 70 74 64" stroke="#2e1b12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <path d="M106 64 Q114 70 122 64" stroke="#2e1b12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </g>
                  ) : (
                    <g className="anim-human-blink">
                      <ellipse cx="66" cy="62" rx="7" ry="8" fill="#ffffff" />
                      <ellipse cx="66.5" cy="62.5" rx="5" ry="5.5" fill="#2d1c16" />
                      <circle cx="68.5" cy="60" r="2" fill="#ffffff" />
                      <circle cx="64.5" cy="64.5" r="1" fill="#ffffff" opacity="0.8" />
                      <path d="M58 52 Q66 48 74 52" stroke="#231815" strokeWidth="2.2" strokeLinecap="round" fill="none" />

                      <ellipse cx="114" cy="62" rx="7" ry="8" fill="#ffffff" />
                      <ellipse cx="113.5" cy="62.5" rx="5" ry="5.5" fill="#2d1c16" />
                      <circle cx="115.5" cy="60" r="2" fill="#ffffff" />
                      <circle cx="111.5" cy="64.5" r="1" fill="#ffffff" opacity="0.8" />
                      <path d="M106 52 Q114 48 122 52" stroke="#231815" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    </g>
                  )}

                  <circle cx="56" cy="73" r="6" fill="#f87171" opacity="0.35" />
                  <circle cx="124" cy="73" r="6" fill="#f87171" opacity="0.35" />

                  <path d="M76 82 Q90 92 104 82" stroke="#682c1e" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
              )}

              {/* Hair */}
              {isCoach ? (
                <g>
                  <path d="M40 48 C40 24, 60 16, 90 16 C120 16, 140 24, 140 48 C136 34, 120 25, 90 25 C60 25, 44 34, 40 48 Z" fill="url(#hairGrad)" />
                  <ellipse cx="90" cy="15" rx="14" ry="10" fill="#451a03" />
                  <ellipse cx="90" cy="14" rx="11" ry="8" fill="#78350f" />
                </g>
              ) : (
                <g>
                  <path d="M40 50 C40 25, 60 16, 90 16 C120 16, 140 25, 140 50 C136 36, 120 26, 90 26 C60 26, 44 36, 40 50 Z" fill="url(#hairGrad)" />
                  <path d="M70 20 C78 12, 98 14, 102 22 C94 18, 80 18, 70 20 Z" fill="#1c1917" />
                </g>
              )}
            </g>

            {/* 5. VISUAL PARTICLES */}
            {isDrinking && (
              <g className="fx-droplets">
                <circle cx="146" cy="112" r="2.5" fill="#38bdf8" className="fx-water-drop-1" />
                <circle cx="152" cy="122" r="1.8" fill="#7dd3fc" className="fx-water-drop-2" />
                <circle cx="138" cy="104" r="1.5" fill="#bae6fd" className="fx-water-drop-3" />
              </g>
            )}

            {isStretching && (
              <g className="fx-stretch-burst">
                <text x="20" y="76" fill="#38bdf8" fontSize="20" className="fx-sparkle-l">✦</text>
                <text x="146" y="76" fill="#38bdf8" fontSize="20" className="fx-sparkle-r">✦</text>
                <path d="M24 98 Q38 82 52 92" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
                <path d="M154 98 Q140 82 126 92" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
              </g>
            )}

            {isRestingEyes && (
              <g className="fx-zzz-group" transform="translate(122, 24)">
                <text x="0" y="0" fill="#7dd3fc" fontSize="15" fontWeight="bold" className="fx-zzz-1">z</text>
                <text x="10" y="-10" fill="#38bdf8" fontSize="12" fontWeight="bold" className="fx-zzz-2">z</text>
              </g>
            )}

            {isCelebrating && (
              <g className="fx-celebrate-burst">
                <text x="24" y="32" fill="#facc15" fontSize="18" className="fx-star-1">★</text>
                <text x="142" y="34" fill="#38bdf8" fontSize="20" className="fx-star-2">✦</text>
                <text x="86" y="10" fill="#f43f5e" fontSize="16" className="fx-star-3">♦</text>
                <circle cx="40" cy="18" r="3.5" fill="#34d399" />
                <circle cx="132" cy="18" r="3.5" fill="#f472b6" />
              </g>
            )}

          </g>
        </svg>
      </div>
    </div>
  );
};
