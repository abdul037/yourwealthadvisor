import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export type MascotState = 'idle' | 'talking' | 'celebrating' | 'waving' | 'thinking';

type MascotSize = 'sm' | 'md' | 'lg';

interface NaylaMascotProps {
  state?: MascotState;
  size?: MascotSize;
  className?: string;
}

const SIZE_PRESET: Record<
  MascotSize,
  {
    w: number;
    h: number;
    shadowW: number;
    shadowH: number;
    auraOpacity: number;
    chartScale: number;
    chartLeft: string;
    chartTop: string;
    thoughtScale: number;
    sparkleScale: number;
  }
> = {
  sm: {
    w: 72,
    h: 92,
    shadowW: 0.56,
    shadowH: 0.09,
    auraOpacity: 0.84,
    chartScale: 0.82,
    chartLeft: '5.5%',
    chartTop: '30%',
    thoughtScale: 0.86,
    sparkleScale: 0.9,
  },
  md: {
    w: 104,
    h: 132,
    shadowW: 0.58,
    shadowH: 0.1,
    auraOpacity: 0.96,
    chartScale: 1,
    chartLeft: '6.5%',
    chartTop: '30%',
    thoughtScale: 1,
    sparkleScale: 1,
  },
  lg: {
    w: 146,
    h: 186,
    shadowW: 0.62,
    shadowH: 0.105,
    auraOpacity: 1,
    chartScale: 1.13,
    chartLeft: '7%',
    chartTop: '29%',
    thoughtScale: 1.14,
    sparkleScale: 1.08,
  },
};

const SCENE_ANIM: Record<MascotState, string> = {
  idle: 'nayla-scene-idle 4.2s ease-in-out infinite',
  talking: 'nayla-scene-talk 1s ease-in-out infinite',
  waving: 'nayla-scene-wave 2s ease-in-out infinite',
  thinking: 'nayla-scene-think 4.5s ease-in-out infinite',
  celebrating: 'nayla-scene-celebrate 0.9s ease-in-out 4',
};

const PHOTO_ANIM: Record<MascotState, string> = {
  idle: 'nayla-photo-idle 4.3s ease-in-out infinite',
  talking: 'nayla-photo-talk 0.98s ease-in-out infinite',
  waving: 'nayla-photo-wave 1.8s ease-in-out infinite',
  thinking: 'nayla-photo-think 3.2s ease-in-out infinite',
  celebrating: 'nayla-photo-celebrate 0.84s ease-in-out 4',
};

const SHADOW_ANIM: Record<MascotState, string> = {
  idle: 'nayla-shadow-idle 4.2s ease-in-out infinite',
  talking: 'nayla-shadow-talk 1s ease-in-out infinite',
  waving: 'nayla-shadow-wave 2s ease-in-out infinite',
  thinking: 'nayla-shadow-think 4.5s ease-in-out infinite',
  celebrating: 'nayla-shadow-celebrate 0.9s ease-in-out 4',
};

const CHART_ANIM: Record<MascotState, string> = {
  idle: 'nayla-chart-idle 3.6s ease-in-out infinite',
  talking: 'nayla-chart-talk 0.95s ease-in-out infinite',
  waving: 'nayla-chart-wave 1.15s ease-in-out infinite',
  thinking: 'nayla-chart-think 2.3s ease-in-out infinite',
  celebrating: 'nayla-chart-celebrate 0.72s ease-in-out 5',
};

function Sparkle({
  color,
  tx,
  ty,
  delay,
  size,
}: {
  color: string;
  tx: number;
  ty: number;
  delay: string;
  size: number;
}) {
  return (
    <span
      className="nayla-sparkle"
      style={
        {
          ['--tx' as string]: `${tx}px`,
          ['--ty' as string]: `${ty}px`,
          ['--sparkle-color' as string]: color,
          ['--sparkle-size' as string]: `${size}px`,
          animationDelay: delay,
        } as CSSProperties
      }
    />
  );
}

function ThoughtOrb({ delay, radius }: { delay: string; radius: string }) {
  return (
    <span
      className="nayla-thought-orb"
      style={
        {
          ['--orb-radius' as string]: radius,
          animationDelay: delay,
        } as CSSProperties
      }
    />
  );
}

export function NaylaMascot({ state = 'idle', size = 'md', className }: NaylaMascotProps) {
  const preset = SIZE_PRESET[size];

  return (
    <div
      className={cn('nayla-scene relative inline-flex items-end justify-center select-none', className)}
      style={{ width: preset.w, height: preset.h }}
    >
      <span
        className="absolute left-1/2 bottom-[4%] -translate-x-1/2 rounded-full bg-black/45 blur-[6px]"
        style={{
          width: preset.w * preset.shadowW,
          height: preset.h * preset.shadowH,
          animation: SHADOW_ANIM[state],
        }}
      />

      <span className="nayla-aura" style={{ opacity: preset.auraOpacity }} />

      {state === 'thinking' && (
        <>
          <ThoughtOrb delay="0s" radius={`${22 * preset.thoughtScale}px`} />
          <ThoughtOrb delay="0.85s" radius={`${26 * preset.thoughtScale}px`} />
          <ThoughtOrb delay="1.7s" radius={`${30 * preset.thoughtScale}px`} />
        </>
      )}

      {state === 'celebrating' && (
        <>
          <Sparkle color="#7dd3fc" tx={-42 * preset.sparkleScale} ty={-46 * preset.sparkleScale} delay="0.02s" size={10 * preset.sparkleScale} />
          <Sparkle color="#fbbf24" tx={36 * preset.sparkleScale} ty={-44 * preset.sparkleScale} delay="0.1s" size={11 * preset.sparkleScale} />
          <Sparkle color="#fb7185" tx={-34 * preset.sparkleScale} ty={26 * preset.sparkleScale} delay="0.17s" size={9 * preset.sparkleScale} />
          <Sparkle color="#4ade80" tx={39 * preset.sparkleScale} ty={22 * preset.sparkleScale} delay="0.08s" size={8 * preset.sparkleScale} />
          <Sparkle color="#a78bfa" tx={3 * preset.sparkleScale} ty={-52 * preset.sparkleScale} delay="0.04s" size={10 * preset.sparkleScale} />
          <Sparkle color="#22d3ee" tx={-45 * preset.sparkleScale} ty={2 * preset.sparkleScale} delay="0.22s" size={9 * preset.sparkleScale} />
          <Sparkle color="#f59e0b" tx={44 * preset.sparkleScale} ty={-2 * preset.sparkleScale} delay="0.2s" size={9 * preset.sparkleScale} />
        </>
      )}

      <div className="relative h-full w-full" style={{ animation: SCENE_ANIM[state] }}>
        <div className="absolute inset-0 flex items-end justify-center">
          <div className="nayla-photo-shell" style={{ animation: PHOTO_ANIM[state] }}>
            <img
              src="/nayla.jpg"
              alt="Nayla mascot"
              className="nayla-photo-image"
              draggable={false}
            />
            <span className="nayla-photo-depth" />
            <span className="nayla-photo-sheen" />
          </div>
        </div>

        <div
          className="absolute pointer-events-none"
          style={{ left: preset.chartLeft, top: preset.chartTop, transform: `scale(${preset.chartScale})`, transformOrigin: 'left top' }}
        >
          <svg width="74" height="50" viewBox="0 0 74 50" fill="none" style={{ animation: CHART_ANIM[state] }}>
            <defs>
              <linearGradient id="nayla-chart-stroke" x1="0" y1="0" x2="74" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fde68a" />
                <stop offset="0.5" stopColor="#fdba74" />
                <stop offset="1" stopColor="#fef3c7" />
              </linearGradient>
              <linearGradient id="nayla-chart-fill" x1="0" y1="0" x2="74" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fde68a" stopOpacity="0.22" />
                <stop offset="1" stopColor="#fdba74" stopOpacity="0.06" />
              </linearGradient>
              <filter id="nayla-chart-glow" x="-30%" y="-45%" width="180%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.6" floodColor="#f59e0b" floodOpacity="0.85" />
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#fde68a" floodOpacity="0.36" />
              </filter>
            </defs>

            <g filter="url(#nayla-chart-glow)">
              <rect x="1.5" y="1.5" width="71" height="47" rx="9" fill="url(#nayla-chart-fill)" stroke="url(#nayla-chart-stroke)" strokeWidth="2" />
              <path d="M12 36V15" stroke="url(#nayla-chart-stroke)" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
              <path d="M12 36H59" stroke="url(#nayla-chart-stroke)" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
              <path d="M12 34L22 26L29 27L39 20L48 21L58 14" stroke="url(#nayla-chart-stroke)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M58 14L56 14.2L57.7 16.1" stroke="url(#nayla-chart-stroke)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
