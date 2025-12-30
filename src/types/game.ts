import { Achievement, Statistics, UnlockedAchievementNotification } from './achievements';
import { AIDifficulty } from '../utils/aiPlayer';
import { MarkerThemeId } from './markers';

export type Player = 'X' | 'O' | null;

export type Board = Player[];

export type GameMode = 'pvp' | 'ai' | 'multiplayer';
export type BoardSize = 3 | 4 | 5;

export interface GameState {
  board: Board;
  boardSize: BoardSize;
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
  // AI system fields
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  aiPlayer: Player | null; // Which player is AI (X or O)
  humanPlayer: Player; // Which player is human (X or O)
  // Marker theme
  markerTheme: MarkerThemeId;
}

export interface GameStats {
  gamesPlayed: number;
  xWins: number;
  oWins: number;
  draws: number;
}
