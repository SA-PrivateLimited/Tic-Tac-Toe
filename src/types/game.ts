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
}

export interface GameStats {
  gamesPlayed: number;
  xWins: number;
  oWins: number;
  draws: number;
}
