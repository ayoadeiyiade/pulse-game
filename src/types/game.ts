export type GameState = 'IDLE' | 'IN_RUN' | 'RESET_FLASH';

export type RewardTierType = 'STANDARD' | 'SUPER' | 'JACKPOT' | 'OVERDRIVE';

export interface HitResult {
  status: 'HIT' | 'MISS';
  type?: RewardTierType;
  score?: number;
  baseScore?: number;
  multiplier?: number;
  color?: string;
  scale?: number;
  flash?: boolean;
  shake?: boolean;
  precisionDelta?: number;
  precisionRating?: 'PERFECT' | 'GREAT' | 'GOOD';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  maxLife: number;
  life: number;
  shape?: 'circle' | 'spark' | 'ring';
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  width: number;
  alpha: number;
}

export interface FloatText {
  id: string;
  text: string;
  subtext?: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  alpha: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  streak: number;
  bestStreak: number;
  runsCount: number;
  jackpotsCount: number;
  overdrivesCount: number;
  superCount: number;
  standardCount: number;
  totalHits: number;
  totalMisses: number;
}

export const COLOR_PALETTE = {
  background: '#0B0E14',
  primaryTarget: '#00F0FF',  // Cyber Cyan
  superReward: '#FF007A',    // Electric Magenta
  jackpotHit: '#FFB800',     // Sunburst Gold
  missFail: '#FF3355',       // Crimson Coral
  white: '#FFFFFF',
};
