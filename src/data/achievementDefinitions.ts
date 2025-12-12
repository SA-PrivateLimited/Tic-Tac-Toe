import { AchievementId } from '../types/achievements';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  target?: number; // For progressive achievements
}

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementId, AchievementDefinition> = {
  first_win: {
    id: 'first_win',
    title: 'First Victory',
    description: 'Win your first game',
    icon: '🎉',
  },
  first_win_x: {
    id: 'first_win_x',
    title: 'X Marks the Spot',
    description: 'Win your first game as Player X',
    icon: '❌',
  },
  first_win_o: {
    id: 'first_win_o',
    title: 'O Captain',
    description: 'Win your first game as Player O',
    icon: '⭕',
  },
  veteran: {
    id: 'veteran',
    title: 'Veteran Player',
    description: 'Play 100 games',
    icon: '🎮',
    target: 100,
  },
  hot_streak: {
    id: 'hot_streak',
    title: 'Hot Streak',
    description: 'Win 3 games in a row',
    icon: '🔥',
    target: 3,
  },
  on_fire: {
    id: 'on_fire',
    title: 'On Fire',
    description: 'Win 5 games in a row',
    icon: '🔥🔥',
    target: 5,
  },
  unstoppable: {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Win 10 games in a row',
    icon: '🔥🔥🔥',
    target: 10,
  },
  perfect_game: {
    id: 'perfect_game',
    title: 'Perfect Game',
    description: 'Win a game without opponent scoring',
    icon: '⭐',
  },
  comeback_king: {
    id: 'comeback_king',
    title: 'Comeback King',
    description: 'Win after being behind in score',
    icon: '👑',
  },
  speedster: {
    id: 'speedster',
    title: 'Speedster',
    description: 'Win a game in under 10 seconds',
    icon: '⚡',
  },
  ai_destroyer_easy: {
    id: 'ai_destroyer_easy',
    title: 'AI Destroyer (Easy)',
    description: 'Beat Easy AI 10 times',
    icon: '🤖',
    target: 10,
  },
  ai_destroyer_medium: {
    id: 'ai_destroyer_medium',
    title: 'AI Destroyer (Medium)',
    description: 'Beat Medium AI 10 times',
    icon: '🤖🤖',
    target: 10,
  },
  ai_destroyer_hard: {
    id: 'ai_destroyer_hard',
    title: 'AI Conqueror',
    description: 'Beat Hard AI once',
    icon: '🏆',
    target: 1,
  },
  draw_master: {
    id: 'draw_master',
    title: 'Draw Master',
    description: 'Achieve 10 draw games',
    icon: '🤝',
    target: 10,
  },
  master: {
    id: 'master',
    title: 'Grandmaster',
    description: 'Play 500 games',
    icon: '👑',
    target: 500,
  },
};

// Helper to initialize achievements array
export const initializeAchievements = () => {
  return Object.values(ACHIEVEMENT_DEFINITIONS).map(def => ({
    ...def,
    unlocked: false,
    progress: def.target ? 0 : undefined,
  }));
};
