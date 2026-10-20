import React from 'react';
import type { MascotState } from '../types/deskbuddy';

export interface PixarRobotProps {
  state?: MascotState;
  size?: number;
  direction?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
}

export const PixarRobot: React.FC<PixarRobotProps> = ({
  state = 'idle',
  size = 140,
  direction = 'right',
  className = '',
  onClick
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  const assetNameMap: Record<MascotState, string> = {
    idle: 'idle',
    walking: 'walk',
    drinking: 'drink',
    stretching: 'stretch',
    'resting-eyes': 'eyes',
    celebrating: 'celebrate'
  };

  const assetKey = assetNameMap[state] || 'idle';

  const [imgSrc, setImgSrc] = React.useState<string>(() => {
    try {
      const stored = localStorage.getItem(`deskbuddy_asset_${assetKey}`);
      if (stored) return stored;
    } catch {}
    return `./mascot/${assetKey}.webp`;
  });

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`deskbuddy_asset_${assetKey}`);
      if (stored) {
        setImgSrc(stored);
        setImgFailed(false);
        return;
      }
    } catch {}
    setImgSrc(`./mascot/${assetKey}.webp`);
    setImgFailed(false);
  }, [assetKey]);

  // Pre-load all animation assets on mount for zero-latency state transitions
  React.useEffect(() => {
    const keys = ['idle', 'walk', 'drink', 'stretch', 'eyes', 'celebrate'];
    keys.forEach((k) => {
      const img = new Image();
      img.src = `./mascot/${k}.webp`;
    });
  }, []);

  // If WebP / GIF animation is available, display the silky-smooth hardware-accelerated animated character!
  if (!imgFailed) {
    return (
      <div
        className={`pixar-robot-root state-${state} dir-${direction} ${className}`}
        style={{
          width: size,
          height: size * 1.25,
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          userSelect: 'none'
        }}
        onClick={onClick}
        role="img"
        aria-label={`Pixar Robot - ${state}`}
      >
        <div
          className="robot-flip-wrapper"
          style={{
            width: '100%',
            height: '100%',
            transform: direction === 'left' ? 'scaleX(-1)' : 'none',
            transition: 'transform 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={imgSrc}
            alt={`Pixar Robot ${state}`}
            onError={() => {
              if (imgSrc.endsWith('.webp')) {
                setImgSrc(`./mascot/${assetKey}.gif`);
              } else {
                setImgFailed(true);
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

  const isWalking = state === 'walking';
  const isDrinking = state === 'drinking';
  const isStretching = state === 'stretching';
  const isRestingEyes = state === 'resting-eyes';
  const isCelebrating = state === 'celebrating';

  return (
    <div
      className={`pixar-robot-root state-${state} dir-${direction} ${className}`}
      style={{
        width: size,
        height: size * 1.3,
        cursor: onClick ? 'pointer' : 'default',
        willChange: 'transform'
      }}
      onClick={onClick}
      role="img"
      aria-label={`Pixar Robot - ${state}`}
    >
      <div className={`robot-flip-wrapper ${direction === 'left' ? 'flip-left' : ''}`}>
        <svg
          viewBox="0 0 180 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pixar-robot-svg"
        >
          <defs>
            {/* Pixar Glossy Ceramic Shading */}
            <linearGradient id="ceramicBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f1f5f9" />
              <stop offset="85%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="ceramicHead" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#f8fafc" />
              <stop offset="80%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Glossy Obsidian Visor */}
            <linearGradient id="glassVisor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#030712" />
              <stop offset="100%" stopColor="#0b132b" />
            </linearGradient>

            {/* Glowing Cyan OLED Screen */}
            <radialGradient id="cyanOled" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="85%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>

            {/* High-tech Water Bottle Gradients */}
            <linearGradient id="flaskBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#7dd3fc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="waterFlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Glowing Core Reactor */}
            <radialGradient id="coreReactor" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#22d3ee" />
              <stop offset="80%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0e7490" />
            </radialGradient>

            {/* Soft Ambient 3D Occlusion Shadow */}
            <filter id="pixarShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="4.5" floodColor="#020617" floodOpacity="0.38" />
            </filter>

            {/* Neon Glow Filter */}
            <filter id="oledGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dynamic Ground Contact Shadow */}
          <ellipse
            cx="90"
            cy="204"
            rx={isWalking ? 40 : isCelebrating ? 32 : 46}
            ry="7.5"
            fill="#020617"
            opacity="0.3"
            className="pixar-ground-shadow"
          />

          {/* SKELETON RIG (GPU Animated) */}
          <g className={`pixar-rig ${isWalking ? 'rig-walking' : ''} ${isCelebrating ? 'rig-celebrating' : ''}`}>

            {/* 1. FLOATING MAGNETIC FEET / BOOTS */}
            <g className="pixar-feet">
              {/* Left Boot */}
              <g className={`pixar-foot foot-left ${isWalking ? 'anim-walk-foot-left' : ''}`}>
                <ellipse cx="64" cy="186" rx="14" ry="7" fill="url(#ceramicBody)" filter="url(#pixarShadow)" />
                <ellipse cx="64" cy="188" rx="12" ry="3" fill="#38bdf8" opacity="0.8" />
                <circle cx="64" cy="186" r="3" fill="#ffffff" />
              </g>

              {/* Right Boot */}
              <g className={`pixar-foot foot-right ${isWalking ? 'anim-walk-foot-right' : ''}`}>
                <ellipse cx="116" cy="186" rx="14" ry="7" fill="url(#ceramicBody)" filter="url(#pixarShadow)" />
                <ellipse cx="116" cy="188" rx="12" ry="3" fill="#38bdf8" opacity="0.8" />
                <circle cx="116" cy="186" r="3" fill="#ffffff" />
              </g>
            </g>

            {/* 2. CHASSIS / TORSO */}
            <g className="pixar-torso" filter="url(#pixarShadow)">
              {/* Floating Magnetic Neck Ring */}
              <ellipse cx="90" cy="104" rx="20" ry="6" fill="#334155" />
              <ellipse cx="90" cy="103" rx="16" ry="4" fill="#38bdf8" opacity="0.7" />

              {/* Main Pearlescent Body */}
              <rect
                x="52"
                y="106"
                width="76"
                height="56"
                rx="24"
                fill="url(#ceramicBody)"
                stroke="#e2e8f0"
                strokeWidth="2"
              />

              {/* Specular Highlight on Body Shoulder */}
              <path
                d="M58 114 C62 108, 80 108, 90 108"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Glowing Chest Reactor */}
              <circle
                cx="90"
                cy="134"
                r="11"
                fill="url(#coreReactor)"
                filter="url(#oledGlow)"
                className="pixar-core-pulse"
              />
              <circle cx="90" cy="134" r="4.5" fill="#ffffff" />

              {/* DB Emblem */}
              <text
                x="65"
                y="126"
                fill="#64748b"
                fontSize="7"
                fontWeight="900"
                letterSpacing="0.5"
                opacity="0.7"
              >
                DB
              </text>
            </g>

            {/* 3. MAGNETIC ARMS, HANDS & WATER BOTTLE */}
            <g className="pixar-arms">
              {/* Left Floating Arm */}
              <g className={`pixar-arm arm-left ${isWalking ? 'anim-walk-arm-left' : ''} ${isStretching ? 'anim-stretch-arm-left' : ''}`}>
                <path
                  d="M36 112 C32 112, 30 144, 38 148 C44 150, 48 146, 48 140 L46 112 Z"
                  fill="url(#ceramicBody)"
                  filter="url(#pixarShadow)"
                />
                {/* Magnetic Hand */}
                <circle cx="42" cy="150" r="7.5" fill="url(#ceramicBody)" stroke="#38bdf8" strokeWidth="1" />
                <circle cx="42" cy="150" r="3.5" fill="#38bdf8" />
              </g>

              {/* Right Floating Arm (with Water Bottle) */}
              <g className={`pixar-arm arm-right ${isWalking ? 'anim-walk-arm-right' : ''} ${isDrinking ? 'anim-drinking-arm' : ''} ${isStretching ? 'anim-stretch-arm-right' : ''}`}>
                <path
                  d="M128 112 C132 112, 134 144, 126 148 C120 150, 116 146, 116 140 L118 112 Z"
                  fill="url(#ceramicBody)"
                  filter="url(#pixarShadow)"
                />
                {/* Magnetic Hand */}
                <circle cx="122" cy="150" r="7.5" fill="url(#ceramicBody)" stroke="#38bdf8" strokeWidth="1" />
                <circle cx="122" cy="150" r="3.5" fill="#38bdf8" />

                {/* REALISTIC HIGH-TECH GLOWING WATER FLASK */}
                {isDrinking && (
                  <g className="pixar-water-bottle" transform="translate(112, 122)">
                    {/* Bottle Cap & Handle Loop */}
                    <path
                      d="M6 -10 C6 -13, 14 -13, 14 -10 L14 -6 L6 -6 Z"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                    />
                    <rect x="4" y="-6" width="12" height="5" rx="1.5" fill="#1e293b" />
                    {/* Straw with cute bend */}
                    <path
                      d="M10 -6 L10 -15 L4 -18"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Flask Body */}
                    <rect
                      x="0"
                      y="-1"
                      width="20"
                      height="34"
                      rx="6"
                      fill="url(#flaskBody)"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      filter="url(#oledGlow)"
                    />
                    {/* Sloshing Water Level */}
                    <rect
                      x="2"
                      y="11"
                      width="16"
                      height="20"
                      rx="4"
                      fill="url(#waterFlow)"
                    />
                    {/* Water Surface Wave */}
                    <path
                      d="M2 12 Q10 9 18 12"
                      stroke="#bae6fd"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    {/* Measurement Lines */}
                    <line x1="3" y1="17" x2="7" y2="17" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                    <line x1="3" y1="22" x2="9" y2="22" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
                    <line x1="3" y1="27" x2="7" y2="27" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                    {/* Cute Water Drop Badge on Flask */}
                    <path
                      d="M13 19 C13 17, 11 15, 11 15 C11 15, 9 17, 9 19 C9 20.5, 10 21.5, 11 21.5 C12 21.5, 13 20.5, 13 19 Z"
                      fill="#ffffff"
                      opacity="0.95"
                    />
                  </g>
                )}
              </g>
            </g>

            {/* 4. GLOSSY HEAD & VISOR WITH PIXAR EXPRESSIONS */}
            <g className={`pixar-head ${isDrinking ? 'anim-drink-head' : ''}`} filter="url(#pixarShadow)">
              {/* Antenna with Glowing Orb */}
              <path
                d="M90 28 L90 12"
                stroke="#64748b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx="90"
                cy="10"
                r="5"
                fill="url(#cyanOled)"
                filter="url(#oledGlow)"
                className="antenna-pulse"
              />
              <circle cx="90" cy="9" r="1.8" fill="#ffffff" />

              {/* Glossy Ceramic Head Shape */}
              <rect
                x="44"
                y="26"
                width="92"
                height="78"
                rx="39"
                fill="url(#ceramicHead)"
                stroke="#f1f5f9"
                strokeWidth="2"
              />

              {/* Head Specular Highlight (Pixar 3D shine) */}
              <ellipse
                cx="72"
                cy="36"
                rx="18"
                ry="7"
                fill="#ffffff"
                opacity="0.6"
                transform="rotate(-15 72 36)"
              />

              {/* Dark Obsidian Visor */}
              <rect
                x="52"
                y="40"
                width="76"
                height="50"
                rx="25"
                fill="url(#glassVisor)"
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Visor Glass Curved Glare */}
              <path
                d="M58 50 C68 44, 102 44, 116 52 C108 48, 72 48, 58 50 Z"
                fill="#ffffff"
                opacity="0.3"
              />

              {/* EXPRESSIVE PIXAR OLED EYES ACCORDING TO HABIT */}
              {isDrinking ? (
                // Happy curved drinking eyes: (^ ‿ ^)
                <g filter="url(#oledGlow)">
                  <path
                    d="M66 68 Q74 58 82 68"
                    stroke="#00f2fe"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M98 68 Q106 58 114 68"
                    stroke="#00f2fe"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Cute glowing blush dots */}
                  <circle cx="62" cy="74" r="3.5" fill="#f43f5e" opacity="0.65" />
                  <circle cx="118" cy="74" r="3.5" fill="#f43f5e" opacity="0.65" />
                </g>
              ) : isRestingEyes ? (
                // Calm resting curved eyes: (- ‿ -)
                <g filter="url(#oledGlow)">
                  <path
                    d="M66 65 Q74 70 82 65"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.85"
                  />
                  <path
                    d="M98 65 Q106 70 114 65"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.85"
                  />
                </g>
              ) : isCelebrating ? (
                // Star eyes: (★ ‿ ★)
                <g filter="url(#oledGlow)">
                  <text x="64" y="70" fill="#facc15" fontSize="17" fontWeight="bold">★</text>
                  <text x="96" y="70" fill="#facc15" fontSize="17" fontWeight="bold">★</text>
                </g>
              ) : (
                // Standard bright friendly Pixar pill eyes with natural blink
                <g className="pixar-eye-blink" filter="url(#oledGlow)">
                  {/* Left Eye */}
                  <rect x="66" y="55" width="13" height="18" rx="6.5" fill="url(#cyanOled)" />
                  <circle cx="69" cy="58" r="2.5" fill="#ffffff" />

                  {/* Right Eye */}
                  <rect x="101" y="55" width="13" height="18" rx="6.5" fill="url(#cyanOled)" />
                  <circle cx="104" cy="58" r="2.5" fill="#ffffff" />
                </g>
              )}

              {/* Visor Bottom Reflection */}
              <ellipse cx="90" cy="85" rx="20" ry="2" fill="#38bdf8" opacity="0.25" />
            </g>

            {/* 5. VISUAL PARTICLES (GPU Hardware Animated) */}
            {isDrinking && (
              <g className="fx-droplets">
                <circle cx="140" cy="112" r="2.5" fill="#38bdf8" className="fx-water-drop-1" />
                <circle cx="148" cy="122" r="1.8" fill="#7dd3fc" className="fx-water-drop-2" />
                <circle cx="134" cy="104" r="1.5" fill="#bae6fd" className="fx-water-drop-3" />
              </g>
            )}

            {isStretching && (
              <g className="fx-stretch-burst">
                <text x="20" y="72" fill="#38bdf8" fontSize="22" className="fx-sparkle-l">✦</text>
                <text x="146" y="72" fill="#38bdf8" fontSize="22" className="fx-sparkle-r">✦</text>
                <path d="M24 94 Q38 78 52 88" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
                <path d="M154 94 Q140 78 126 88" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
              </g>
            )}

            {isRestingEyes && (
              <g className="fx-zzz-group" transform="translate(122, 22)">
                <text x="0" y="0" fill="#7dd3fc" fontSize="15" fontWeight="bold" className="fx-zzz-1">z</text>
                <text x="10" y="-10" fill="#38bdf8" fontSize="12" fontWeight="bold" className="fx-zzz-2">z</text>
              </g>
            )}

            {isCelebrating && (
              <g className="fx-celebrate-burst">
                <text x="22" y="30" fill="#facc15" fontSize="18" className="fx-star-1">★</text>
                <text x="142" y="32" fill="#38bdf8" fontSize="20" className="fx-star-2">✦</text>
                <text x="86" y="8" fill="#f43f5e" fontSize="16" className="fx-star-3">♦</text>
                <circle cx="38" cy="16" r="3.5" fill="#34d399" />
                <circle cx="134" cy="16" r="3.5" fill="#f472b6" />
              </g>
            )}

          </g>
        </svg>
      </div>
    </div>
  );
};

