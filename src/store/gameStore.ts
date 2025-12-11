import { create } from 'zustand';
import { GameState, Player } from '../types/game';
import { checkWinner, checkDraw, getEmptyBoard } from '../utils/gameLogic';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import sound manager with error handling
let playMoveSound: (() => void) = () => {
  // Default no-op function
};

try {
  const soundModule = require('../utils/soundManager');
  if (soundModule && soundModule.playMoveSound) {
    playMoveSound = soundModule.playMoveSound;
  }
} catch (error) {
  console.log('Sound module not available:', error);
}

interface GameStore extends GameState {
  makeMove: (index: number) => void;
  resetGame: () => void;
  resetScores: () => void;
  loadScores: () => Promise<void>;
  // Betting system methods
  setBetAmount: (amount: number) => void;
  resetBalances: () => void;
  loadBalances: () => Promise<void>;
  setShowBetModal: (show: boolean) => void;
  setShowWinnerModal: (show: boolean) => void;
}

const SCORES_KEY = '@tictactoe_scores';
const BALANCES_KEY = '@tictactoe_balances'; // Storage key for player balances
const BET_AMOUNT_KEY = '@tictactoe_bet_amount'; // Storage key for bet amount

const initialState: GameState = {
  board: getEmptyBoard(),
  currentPlayer: 'X',
  winner: null,
  isDraw: false,
  scores: {
    X: 0,
    O: 0,
    draws: 0,
  },
  // Betting system initial state
  betAmount: 0,
  playerBalances: {
    X: 0,
    O: 0,
  },
  showBetModal: false,
  showWinnerModal: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  makeMove: (index: number) => {
    const { board, currentPlayer, winner, isDraw } = get();

    if (board[index] || winner || isDraw) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    // Play sound (same sound for both players)
    if (playMoveSound) {
      try {
        playMoveSound();
      } catch (error) {
        console.log('Error playing sound:', error);
      }
    }

    const gameWinner = checkWinner(newBoard);
    const isGameDraw = checkDraw(newBoard);

    const newScores = { ...get().scores };
    const newBalances = { ...get().playerBalances };
    const currentBetAmount = get().betAmount;

    // Update scores when game ends
    if (gameWinner) {
      newScores[gameWinner]++;
      AsyncStorage.setItem(SCORES_KEY, JSON.stringify(newScores));

      // Add bet amount to winner's balance
      if (currentBetAmount > 0) {
        newBalances[gameWinner] += currentBetAmount;
        AsyncStorage.setItem(BALANCES_KEY, JSON.stringify(newBalances));
      }
    } else if (isGameDraw) {
      newScores.draws++;
      AsyncStorage.setItem(SCORES_KEY, JSON.stringify(newScores));
    }

    set({
      board: newBoard,
      currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
      winner: gameWinner,
      isDraw: isGameDraw,
      scores: newScores,
      playerBalances: newBalances,
      // Show winner modal if there's a winner and betting is active
      showWinnerModal: gameWinner !== null && currentBetAmount > 0,
    });
  },

  resetGame: () => {
    set({
      board: getEmptyBoard(),
      currentPlayer: 'X',
      winner: null,
      isDraw: false,
      showWinnerModal: false,
    });
  },

  resetScores: () => {
    const newScores = {
      X: 0,
      O: 0,
      draws: 0,
    };
    AsyncStorage.setItem(SCORES_KEY, JSON.stringify(newScores));
    set({ scores: newScores });
  },

  loadScores: async () => {
    try {
      const scoresJson = await AsyncStorage.getItem(SCORES_KEY);
      if (scoresJson) {
        const scores = JSON.parse(scoresJson);
        set({ scores });
      }
    } catch (error) {
      // Ignore errors
    }
  },

  // Set the bet amount for the current game
  setBetAmount: (amount: number) => {
    AsyncStorage.setItem(BET_AMOUNT_KEY, JSON.stringify(amount));
    set({
      betAmount: amount,
      showBetModal: false, // Close modal after setting bet
    });
  },

  // Reset both player balances to 0
  resetBalances: () => {
    const newBalances = {
      X: 0,
      O: 0,
    };
    AsyncStorage.setItem(BALANCES_KEY, JSON.stringify(newBalances));
    set({ playerBalances: newBalances });
  },

  // Load player balances from AsyncStorage on app start
  loadBalances: async () => {
    try {
      const balancesJson = await AsyncStorage.getItem(BALANCES_KEY);
      if (balancesJson) {
        const balances = JSON.parse(balancesJson);
        set({ playerBalances: balances });
      }
      // Also load bet amount
      const betAmountJson = await AsyncStorage.getItem(BET_AMOUNT_KEY);
      if (betAmountJson) {
        const betAmount = JSON.parse(betAmountJson);
        set({ betAmount });
      }
    } catch (error) {
      // Ignore errors
    }
  },

  // Control visibility of bet modal
  setShowBetModal: (show: boolean) => {
    set({ showBetModal: show });
  },

  // Control visibility of winner modal
  setShowWinnerModal: (show: boolean) => {
    set({ showWinnerModal: show });
  },
}));
