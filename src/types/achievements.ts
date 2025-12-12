export type AchievementId =
  | 'first_win'
  | 'first_win_x'
  | 'first_win_o'
  | 'veteran'
  | 'hot_streak'
  | 'on_fire'
  | 'unstoppable'
  | 'perfect_game'
  | 'comeback_king'
  | 'speedster'
  | 'ai_destroyer_easy'
  | 'ai_destroyer_medium'
  | 'ai_destroyer_hard'
  | 'draw_master'
  | 'master';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string; // emoji
  unlocked: boolean;
  unlockedAt?: number; // timestamp
  progress?: number; // current progress for progressive achievements
  target?: number; // target for progressive achievements
}

export interface Statistics {
  gamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  xWins: number;
  oWins: number;
  currentStreak: number;
  longestStreak: number;
  fastestWin: number; // seconds (0 = no win yet)
  totalPlayTime: number; // seconds
  averageMovesPerGame: number;
  // AI-specific stats
  aiGamesPlayed: number;
  aiWins: {
    easy: number;
    medium: number;
    hard: number;
  };
  aiLosses: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface UnlockedAchievementNotification {
  achievement: Achievement;
  timestamp: number;
}
