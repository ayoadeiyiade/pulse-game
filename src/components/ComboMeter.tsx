import React, { useEffect, useState } from 'react';
import { Zap, Flame, Sparkles } from 'lucide-react';

interface ComboMeterProps {
  streak: number;
  gameState: string;
}

export interface ComboTierInfo {
  name: string;
  minStreak: number;
  multiplier: number;
  color: string;
  glowColor: string;
  nextMinStreak: number | null;
}

export function getCurrentComboTier(streak: number): ComboTierInfo | null {
  if (streak < 5) return null;
  if (streak < 10) {
    return { name: 'PULSE FLOW', minStreak: 5, multiplier: 1.5, color: '#00F0FF', glowColor: 'rgba(0, 240, 255, 0.4)', nextMinStreak: 10 };
  } else if (streak < 20) {
    return { name: 'SUPER CHARGE', minStreak: 10, multiplier: 2.0, color: '#FF007A', glowColor: 'rgba(255, 0, 122, 0.45)', nextMinStreak: 20 };
  } else if (streak < 30) {
    return { name: 'HYPER RHYTHM', minStreak: 20, multiplier: 3.0, color: '#FFB800', glowColor: 'rgba(255, 184, 0, 0.5)', nextMinStreak: 30 };
  } else if (streak < 45) {
    return { name: 'OVERCLOCK', minStreak: 30, multiplier: 4.0, color: '#FF3355', glowColor: 'rgba(255, 51, 85, 0.55)', nextMinStreak: 45 };
  } else {
    return { name: 'GODLIKE FLOW', minStreak: 45, multiplier: 5.0, color: '#A855F7', glowColor: 'rgba(168, 85, 247, 0.65)', nextMinStreak: null };
  }
}

export function getStreakMultiplier(streak: number): number {
  if (streak < 5) return 1.0;
  if (streak < 10) return 1.5;
  if (streak < 20) return 2.0;
  if (streak < 30) return 3.0;
  if (streak < 45) return 4.0;
  return 5.0;
}

export const ComboMeter: React.FC<ComboMeterProps> = ({ streak, gameState }) => {
  const [pulse, setPulse] = useState(false);
  const [lastStreak, setLastStreak] = useState(streak);

  useEffect(() => {
    if (streak !== lastStreak) {
      setLastStreak(streak);
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 140);
      return () => clearTimeout(timer);
    }
  }, [streak, lastStreak]);

  const isVisible = streak >= 5 && gameState === 'IN_RUN';
  const tier = getCurrentComboTier(streak);
  if (!isVisible || !tier) return null;

  let progressPercent = 100;
  let hitsRemaining = 0;
  if (tier.nextMinStreak !== null) {
    const range = tier.nextMinStreak - tier.minStreak;
    const current = streak - tier.minStreak;
    progressPercent = Math.min(100, Math.max(0, Math.round((current / range) * 100)));
    hitsRemaining = tier.nextMinStreak - streak;
  }

  return (
    <div
      className={`fixed bottom-24 right-4 sm:right-8 z-30 pointer-events-none transition-all duration-200 select-none ${
        pulse ? 'scale-105' : 'scale-100'
      }`}
      style={{ filter: `drop-shadow(0 0 16px ${tier.glowColor})` }}
    >
      <div 
        className="flex flex-col items-end bg-[#090d14]/90 border p-3 min-w-[160px] sm:min-w-[180px] backdrop-blur-md transition-colors duration-300"
        style={{ borderColor: tier.color, boxShadow: `inset 0 0 12px ${tier.glowColor}` }}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest font-black uppercase" style={{ color: tier.color }}>
          {tier.multiplier >= 4.0 ? <Flame className="w-3.5 h-3.5 fill-current animate-bounce" /> : tier.multiplier >= 2.0 ? <Zap className="w-3.5 h-3.5 fill-current" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{tier.name}</span>
        </div>
        <div className="flex items-baseline gap-2 my-0.5">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tighter leading-none" style={{ color: tier.color }}>
            {tier.multiplier.toFixed(1)}x
          </div>
          <div className="text-xs font-mono font-bold text-white tracking-wider">
            {streak} COMBO
          </div>
        </div>
        <div className="w-full mt-1.5 space-y-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>BOOST CHARGE</span>
            <span>
              {tier.nextMinStreak !== null ? (
                <>+{hitsRemaining} HITS TO {(tier.multiplier >= 3 ? tier.multiplier + 1 : tier.multiplier + (tier.multiplier === 1.5 ? 0.5 : 1.0)).toFixed(1)}x</>
              ) : (
                <span className="text-amber-300 font-bold">MAX TIER</span>
              )}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="h-full transition-all duration-150" style={{ width: `${progressPercent}%`, backgroundColor: tier.color, boxShadow: `0 0 8px ${tier.color}` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
