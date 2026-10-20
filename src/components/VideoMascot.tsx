import React, { useEffect, useRef } from 'react';

export interface VideoMascotProps {
  src: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  direction?: 'left' | 'right';
}

export const VideoMascot: React.FC<VideoMascotProps> = ({
  src,
  width = 200,
  height = 240,
  className = '',
  onClick,
  direction = 'right'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let isDisposed = false;
    let animId: number;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const renderFrame = () => {
      if (isDisposed) return;

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(video, 0, 0, width, height);

        try {
          const frame = ctx.getImageData(0, 0, width, height);
          const data = frame.data;
          const len = data.length;

          // Detect background type from corners
          // Check corner pixel (top-left)
          const cornerR = data[0];
          const cornerG = data[1];
          const cornerB = data[2];

          const isGreenScreen = cornerG > 75 && cornerG > cornerR * 1.3 && cornerG > cornerB * 1.3;
          const isBlackScreen = cornerR < 25 && cornerG < 25 && cornerB < 25;

          if (isGreenScreen) {
            for (let i = 0; i < len; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Chroma key green
              if (g > 65 && g > r * 1.25 && g > b * 1.25) {
                // Smooth alpha edge
                const diff = g - Math.max(r, b);
                if (diff > 50) {
                  data[i + 3] = 0;
                } else {
                  data[i + 3] = Math.max(0, Math.floor(255 * (1 - diff / 50)));
                }
              }
            }
            ctx.putImageData(frame, 0, 0);
          } else if (isBlackScreen) {
            for (let i = 0; i < len; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Key out pure black
              if (r < 25 && g < 25 && b < 25) {
                data[i + 3] = 0;
              }
            }
            ctx.putImageData(frame, 0, 0);
          }
        } catch {
          // If cross-origin restrictions block getImageData, direct draw remains
        }
      }

      animId = requestAnimationFrame(renderFrame);
    };

    video.play().catch(() => {});
    animId = requestAnimationFrame(renderFrame);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
    };
  }, [src, width, height]);

  return (
    <div
      className={`video-mascot-container ${direction === 'left' ? 'flip-horizontal' : ''} ${className}`}
      onClick={onClick}
      style={{
        width,
        height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.45))'
        }}
      />
    </div>
  );
};

