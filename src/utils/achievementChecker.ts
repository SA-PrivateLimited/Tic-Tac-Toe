import { Achievement, AchievementId, Statistics } from '../types/achievements';
import { Player } from '../types/game';

interface CheckAchievementsParams {
  achievements: Achievement[];
  statistics: Statistics;
  winner: Player | null;
  isDraw: boolean;
  gameTime: number; // in seconds
  previousScores: { X: number; O: number };
  currentScores: { X: number; O: number };
}

export const checkAchievements = (params: CheckAchievementsParams): AchievementId[] => {
  const {
    achievements,
    statistics,
    winner,
    isDraw,
    gameTime,
    previousScores,
    currentScores,
  } = params;

  const newlyUnlocked: AchievementId[] = [];

  // Helper to check if achievement is already unlocked
  const isUnlocked = (id: AchievementId) => {
    return achievements.find(a => a.id === id)?.unlocked || false;
  };

  // First Win
  if (!isUnlocked('first_win') && winner && statistics.totalWins === 1) {
    newlyUnlocked.push('first_win');
  }

  // First Win as X
  if (!isUnlocked('first_win_x') && winner === 'X' && statistics.xWins === 1) {
    newlyUnlocked.push('first_win_x');
  }

  // First Win as O
  if (!isUnlocked('first_win_o') && winner === 'O' && statistics.oWins === 1) {
    newlyUnlocked.push('first_win_o');
  }

  // Veteran (100 games)
  if (!isUnlocked('veteran') && statistics.gamesPlayed >= 100) {
    newlyUnlocked.push('veteran');
  }

  // Master (500 games)
  if (!isUnlocked('master') && statistics.gamesPlayed >= 500) {
    newlyUnlocked.push('master');
  }

  // Hot Streak (3 wins in a row)
  if (!isUnlocked('hot_streak') && statistics.currentStreak >= 3) {
    newlyUnlocked.push('hot_streak');
  }

  // On Fire (5 wins in a row)
  if (!isUnlocked('on_fire') && statistics.currentStreak >= 5) {
    newlyUnlocked.push('on_fire');
  }

  // Unstoppable (10 wins in a row)
  if (!isUnlocked('unstoppable') && statistics.currentStreak >= 10) {
    newlyUnlocked.push('unstoppable');
  }

  // Perfect Game (win without opponent scoring)
  if (!isUnlocked('perfect_game') && winner) {
    const loser = winner === 'X' ? 'O' : 'X';
    const loserScore = currentScores[loser];
    if (loserScore === 0) {
      newlyUnlocked.push('perfect_game');
    }
  }

  // Comeback King (win after being behind)
  if (!isUnlocked('comeback_king') && winner) {
    const winnerPreviousScore = previousScores[winner];
    const loser = winner === 'X' ? 'O' : 'X';
    const loserPreviousScore = previousScores[loser];

    if (loserPreviousScore > winnerPreviousScore) {
      newlyUnlocked.push('comeback_king');
    }
  }

  // Speedster (win in under 10 seconds)
  if (!isUnlocked('speedster') && winner && gameTime > 0 && gameTime < 10) {
    newlyUnlocked.push('speedster');
  }

  // Draw Master (10 draws)
  if (!isUnlocked('draw_master') && isDraw && statistics.totalDraws >= 10) {
    newlyUnlocked.push('draw_master');
  }

  // AI Destroyer achievements (will be implemented when AI is added)
  // For now, these will never trigger as we don't have AI stats yet

  return newlyUnlocked;
};

// Update achievement progress for progressive achievements
export const updateAchievementProgress = (
  achievements: Achievement[],
  statistics: Statistics
): Achievement[] => {
  return achievements.map(achievement => {
    if (achievement.unlocked) return achievement;

    switch (achievement.id) {
      case 'veteran':
        return { ...achievement, progress: statistics.gamesPlayed };
      case 'master':
        return { ...achievement, progress: statistics.gamesPlayed };
      case 'hot_streak':
        return { ...achievement, progress: statistics.currentStreak };
      case 'on_fire':
        return { ...achievement, progress: statistics.currentStreak };
      case 'unstoppable':
        return { ...achievement, progress: statistics.currentStreak };
      case 'draw_master':
        return { ...achievement, progress: statistics.totalDraws };
      case 'ai_destroyer_easy':
        return { ...achievement, progress: statistics.aiWins.easy };
      case 'ai_destroyer_medium':
        return { ...achievement, progress: statistics.aiWins.medium };
      case 'ai_destroyer_hard':
        return { ...achievement, progress: statistics.aiWins.hard };
      default:
        return achievement;
    }
  });
};
