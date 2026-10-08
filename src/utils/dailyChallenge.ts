import { DailyChallenge } from '../types/game';

const DAILY_STORAGE_KEY = 'pulse_daily_challenge_state_v1';

export function getUTCDateString(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

export function getMsUntilNextMidnight(): number {
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return Math.max(0, nextMidnight.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const MODIFIERS = [
  { name: 'Pure Tempo', desc: 'Standard rules. Pure rhythmic timing flow.' },
  { name: 'Gold Rush', desc: 'Jackpot hit probability boosted to 15%!' },
  { name: 'Overdrive Surge', desc: 'Overdrive chance doubled (2.0% RNG)!' },
  { name: 'Super Charged', desc: 'Super hits award +750 pts instead of +500.' },
  { name: 'Neural Focus', desc: 'Rhythm acceleration scales 10% faster.' },
];

export function generateDailyChallenge(dateStr: string): DailyChallenge {
  const hash = hashString(dateStr);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getUTCFullYear(), 0, 0).getTime()) / 86400000);
  const targetScore = 12000 + (hash % 22) * 500;
  const modifier = MODIFIERS[hash % MODIFIERS.length];

  return {
    date: dateStr,
    dayNumber: dayOfYear,
    title: `Protocol #${dayOfYear}`,
    targetScore,
    maxRuns: 3,
    runsUsed: 0,
    bestScoreToday: 0,
    completed: false,
    runScores: [],
    modifierName: modifier.name,
    modifierDesc: modifier.desc,
  };
}

export function loadDailyChallenge(): DailyChallenge {
  const todayStr = getUTCDateString();
  try {
    const savedRaw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (savedRaw) {
      const saved: DailyChallenge = JSON.parse(savedRaw);
      if (saved.date === todayStr) return saved;
    }
  } catch {}
  const fresh = generateDailyChallenge(todayStr);
  saveDailyChallenge(fresh);
  return fresh;
}

export function saveDailyChallenge(challenge: DailyChallenge): void {
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(challenge));
  } catch {}
}

export function recordDailyRun(
  current: DailyChallenge,
  score: number
): { challenge: DailyChallenge; wasNewlyCompleted: boolean } {
  if (current.runsUsed >= current.maxRuns && !current.completed) {
    return { challenge: current, wasNewlyCompleted: false };
  }
  const newRunsUsed = current.runsUsed + 1;
  const newBest = Math.max(current.bestScoreToday, score);
  const wasAlreadyCompleted = current.completed;
  const isNowCompleted = newBest >= current.targetScore || wasAlreadyCompleted;
  const wasNewlyCompleted = !wasAlreadyCompleted && isNowCompleted;

  const updated: DailyChallenge = {
    ...current,
    runsUsed: newRunsUsed,
    bestScoreToday: newBest,
    completed: isNowCompleted,
    runScores: [...current.runScores, score],
  };
  saveDailyChallenge(updated);
  return { challenge: updated, wasNewlyCompleted };
}
