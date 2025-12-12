import { Achievement, Statistics, UnlockedAchievementNotification } from './achievements';

export type Player = 'X' | 'O' | null;

export type Board = Player[];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  isDraw: boolean;
  scores: {
    X: number;
    O: number;
    draws: number;
  };
  // Betting system fields
  betAmount: number;
  playerBalances: {
    X: number;
    O: number;
  };
  showBetModal: boolean;
  showWinnerModal: boolean;
  // Achievement system fields
  achievements: Achievement[];
  statistics: Statistics;
  unlockedNotifications: UnlockedAchievementNotification[];
  gameStartTime: number | null;
  previousScores: { X: number; O: number };
}

export interface GameStats {
  gamesPlayed: number;
  xWins: number;
  oWins: number;
  draws: number;
}
