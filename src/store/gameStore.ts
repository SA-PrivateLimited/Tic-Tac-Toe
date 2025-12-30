import { create } from 'zustand';
import { GameState, Player, GameMode, BoardSize } from '../types/game';
import { checkWinner, checkDraw, getEmptyBoard } from '../utils/gameLogic';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementId } from '../types/achievements';
import { initializeAchievements } from '../data/achievementDefinitions';
import { checkAchievements, updateAchievementProgress } from '../utils/achievementChecker';
import { getAIMove, isAITurn, AIDifficulty } from '../utils/aiPlayer';
import { multiplayerService } from '../services/multiplayerService';
import { MarkerThemeId, DEFAULT_MARKER_THEME } from '../types/markers';

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
  // Achievement system methods
  loadAchievements: () => Promise<void>;
  loadStatistics: () => Promise<void>;
  unlockAchievement: (id: AchievementId) => void;
  checkAndUnlockAchievements: () => void;
  dismissNotification: () => void;
  resetStatistics: () => void;
  // AI system methods
  setGameMode: (mode: GameMode, aiDifficulty?: AIDifficulty, humanPlayer?: Player) => void;
  makeAIMove: () => void;
  // Multiplayer system methods
  setMultiplayerMode: (enabled: boolean) => void;
  handleMultiplayerMove: (index: number, player: Player) => void;
  syncMultiplayerState: () => void;
  // Board size methods
  setBoardSize: (size: BoardSize) => void;
  loadBoardSize: () => Promise<void>;
  // Marker theme methods
  setMarkerTheme: (theme: MarkerThemeId) => Promise<void>;
  loadMarkerTheme: () => Promise<void>;
}

const SCORES_KEY = '@tictactoe_scores';
const BALANCES_KEY = '@tictactoe_balances';
const BET_AMOUNT_KEY = '@tictactoe_bet_amount';
const ACHIEVEMENTS_KEY = '@tictactoe_achievements';
const STATISTICS_KEY = '@tictactoe_statistics';
const GAME_MODE_KEY = '@tictactoe_game_mode';
const AI_DIFFICULTY_KEY = '@tictactoe_ai_difficulty';
const BOARD_SIZE_KEY = '@tictactoe_board_size';
const MARKER_THEME_KEY = '@tictactoe_marker_theme';

const initialState: GameState = {
  board: getEmptyBoard(3),
  boardSize: 3,
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
  // Achievement system initial state
  achievements: initializeAchievements(),
  statistics: {
    gamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    xWins: 0,
    oWins: 0,
    currentStreak: 0,
    longestStreak: 0,
    fastestWin: 0,
    totalPlayTime: 0,
    averageMovesPerGame: 0,
    aiGamesPlayed: 0,
    aiWins: { easy: 0, medium: 0, hard: 0 },
    aiLosses: { easy: 0, medium: 0, hard: 0 },
  },
  unlockedNotifications: [],
  gameStartTime: null,
  previousScores: { X: 0, O: 0 },
  // AI system initial state
  gameMode: 'pvp',
  aiDifficulty: 'medium',
  aiPlayer: null,
  humanPlayer: 'X',
  // Marker theme initial state
  markerTheme: DEFAULT_MARKER_THEME,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  makeMove: (index: number) => {
    const { board, currentPlayer, winner, isDraw, gameStartTime } = get();

    if (board[index] || winner || isDraw) {
      return;
    }

    // Start game timer on first move
    if (gameStartTime === null) {
      set({ gameStartTime: Date.now() });
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

    const boardSize = get().boardSize;
    const gameWinner = checkWinner(newBoard, boardSize);
    const isGameDraw = checkDraw(newBoard, boardSize);

    const newScores = { ...get().scores };
    const newBalances = { ...get().playerBalances };
    const currentBetAmount = get().betAmount;

    // Store previous scores for achievement checking
    const previousScores = { X: get().scores.X, O: get().scores.O };

    // Update statistics
    const newStatistics = { ...get().statistics };
    let shouldCheckAchievements = false;

    // Update scores when game ends
    if (gameWinner) {
      newScores[gameWinner]++;
      AsyncStorage.setItem(SCORES_KEY, JSON.stringify(newScores));

      // Add bet amount to winner's balance
      if (currentBetAmount > 0) {
        newBalances[gameWinner] += currentBetAmount;
        AsyncStorage.setItem(BALANCES_KEY, JSON.stringify(newBalances));
      }

      // Update statistics for win
      newStatistics.gamesPlayed++;
      newStatistics.totalWins++;
      if (gameWinner === 'X') {
        newStatistics.xWins++;
      } else {
        newStatistics.oWins++;
      }
      newStatistics.currentStreak++;
      if (newStatistics.currentStreak > newStatistics.longestStreak) {
        newStatistics.longestStreak = newStatistics.currentStreak;
      }

      // Track AI game statistics
      const state = get();
      if (state.gameMode === 'ai') {
        newStatistics.aiGamesPlayed++;
        const humanWon = gameWinner === state.humanPlayer;
        if (humanWon) {
          newStatistics.aiLosses[state.aiDifficulty]++;
        } else {
          newStatistics.aiWins[state.aiDifficulty]++;
        }
      }

      // Track fastest win
      const gameTime = get().gameStartTime
        ? Math.floor((Date.now() - get().gameStartTime!) / 1000)
        : 0;
      if (gameTime > 0 && (newStatistics.fastestWin === 0 || gameTime < newStatistics.fastestWin)) {
        newStatistics.fastestWin = gameTime;
      }

      AsyncStorage.setItem(STATISTICS_KEY, JSON.stringify(newStatistics));
      shouldCheckAchievements = true;
    } else if (isGameDraw) {
      newScores.draws++;
      AsyncStorage.setItem(SCORES_KEY, JSON.stringify(newScores));

      // Update statistics for draw
      newStatistics.gamesPlayed++;
      newStatistics.totalDraws++;
      newStatistics.currentStreak = 0; // Reset streak on draw
      
      // Track AI game statistics
      const state = get();
      if (state.gameMode === 'ai') {
        newStatistics.aiGamesPlayed++;
      }
      
      AsyncStorage.setItem(STATISTICS_KEY, JSON.stringify(newStatistics));
      shouldCheckAchievements = true;
    }

    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    set({
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: gameWinner,
      isDraw: isGameDraw,
      scores: newScores,
      playerBalances: newBalances,
      statistics: newStatistics,
      previousScores,
      // Show winner modal if there's a winner and betting is active
      showWinnerModal: gameWinner !== null && currentBetAmount > 0,
    });

    // Check achievements after state is updated
    if (shouldCheckAchievements) {
      get().checkAndUnlockAchievements();
    }

    // If game is not over and it's AI's turn, make AI move
    if (!gameWinner && !isGameDraw) {
      const state = get();
      if (state.gameMode === 'ai' && isAITurn(nextPlayer, state.aiPlayer)) {
        // Small delay to make AI move feel more natural
        setTimeout(() => {
          get().makeAIMove();
        }, 500);
      }
    }

    // If multiplayer mode, send move to opponent
    if (get().gameMode === 'multiplayer') {
      multiplayerService.sendMove(index);
      multiplayerService.sendSync(newBoard, nextPlayer, gameWinner, isGameDraw);
    }
  },

  resetGame: () => {
    const state = get();
    const startingPlayer = state.gameMode === 'ai' && state.aiPlayer === 'X' ? 'X' : 'X';
    
    set({
      board: getEmptyBoard(state.boardSize),
      currentPlayer: startingPlayer,
      winner: null,
      isDraw: false,
      showWinnerModal: false,
      gameStartTime: null,
    });

    // If AI goes first, make AI move
    if (state.gameMode === 'ai' && state.aiPlayer === 'X') {
      setTimeout(() => {
        get().makeAIMove();
      }, 500);
    }
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

  // Load achievements from AsyncStorage
  loadAchievements: async () => {
    try {
      const achievementsJson = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      if (achievementsJson) {
        const achievements = JSON.parse(achievementsJson);
        set({ achievements });
      }
    } catch (error) {
      // Ignore errors
    }
  },

  // Load statistics from AsyncStorage
  loadStatistics: async () => {
    try {
      const statisticsJson = await AsyncStorage.getItem(STATISTICS_KEY);
      if (statisticsJson) {
        const statistics = JSON.parse(statisticsJson);
        set({ statistics });
      }
      // Load game mode and AI difficulty
      const gameModeJson = await AsyncStorage.getItem(GAME_MODE_KEY);
      const aiDifficultyJson = await AsyncStorage.getItem(AI_DIFFICULTY_KEY);
      if (gameModeJson) {
        const gameMode = JSON.parse(gameModeJson) as GameMode;
        const aiDifficulty = aiDifficultyJson ? (JSON.parse(aiDifficultyJson) as AIDifficulty) : 'medium';
        const humanPlayer: Player = 'X';
        const aiPlayer: Player = gameMode === 'ai' ? (humanPlayer === 'X' ? 'O' : 'X') : null;
        set({
          gameMode,
          aiDifficulty,
          aiPlayer,
          humanPlayer,
        });
      }
    } catch (error) {
      // Ignore errors
    }
  },

  // Unlock a specific achievement
  unlockAchievement: (id: AchievementId) => {
    const achievements = get().achievements;
    const updatedAchievements = achievements.map(achievement =>
      achievement.id === id
        ? { ...achievement, unlocked: true, unlockedAt: Date.now() }
        : achievement
    );

    AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updatedAchievements));

    // Add notification for the unlocked achievement
    const unlockedAchievement = updatedAchievements.find(a => a.id === id);
    if (unlockedAchievement) {
      const newNotification = {
        achievement: unlockedAchievement,
        timestamp: Date.now(),
      };
      set({
        achievements: updatedAchievements,
        unlockedNotifications: [...get().unlockedNotifications, newNotification],
      });
    }
  },

  // Check achievements and unlock new ones
  checkAndUnlockAchievements: () => {
    const state = get();
    const gameTime = state.gameStartTime
      ? Math.floor((Date.now() - state.gameStartTime) / 1000)
      : 0;

    const newlyUnlockedIds = checkAchievements({
      achievements: state.achievements,
      statistics: state.statistics,
      winner: state.winner,
      isDraw: state.isDraw,
      gameTime,
      previousScores: state.previousScores,
      currentScores: state.scores,
    });

    // Unlock each newly unlocked achievement
    newlyUnlockedIds.forEach(id => {
      get().unlockAchievement(id);
    });

    // Update achievement progress
    const updatedAchievements = updateAchievementProgress(
      get().achievements,
      state.statistics
    );
    AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updatedAchievements));
    set({ achievements: updatedAchievements });
  },

  // Dismiss the first notification in the queue
  dismissNotification: () => {
    const notifications = get().unlockedNotifications;
    if (notifications.length > 0) {
      set({ unlockedNotifications: notifications.slice(1) });
    }
  },

  // Reset all statistics
  resetStatistics: () => {
    const newStatistics = {
      gamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      xWins: 0,
      oWins: 0,
      currentStreak: 0,
      longestStreak: 0,
      fastestWin: 0,
      totalPlayTime: 0,
      averageMovesPerGame: 0,
      aiGamesPlayed: 0,
      aiWins: { easy: 0, medium: 0, hard: 0 },
      aiLosses: { easy: 0, medium: 0, hard: 0 },
    };
    AsyncStorage.setItem(STATISTICS_KEY, JSON.stringify(newStatistics));
    set({ statistics: newStatistics });
  },

  // Set game mode (PvP or AI) and configure AI
  setGameMode: (mode: GameMode, aiDifficulty: AIDifficulty = 'medium', humanPlayer: Player = 'X') => {
    const aiPlayer: Player = humanPlayer === 'X' ? 'O' : 'X';
    
    AsyncStorage.setItem(GAME_MODE_KEY, mode);
    AsyncStorage.setItem(AI_DIFFICULTY_KEY, aiDifficulty);
    
    set({
      gameMode: mode,
      aiDifficulty,
      aiPlayer: mode === 'ai' ? aiPlayer : null,
      humanPlayer,
    });

    // Reset game when changing mode
    get().resetGame();
  },

  // Make AI move (only for 3×3 boards)
  makeAIMove: () => {
    const state = get();
    const { board, aiPlayer, aiDifficulty, winner, isDraw, currentPlayer, boardSize } = state;

    // AI only works for 3×3 boards
    if (boardSize !== 3) {
      return;
    }

    if (!aiPlayer || winner || isDraw || currentPlayer !== aiPlayer) {
      return;
    }

    const aiMove = getAIMove(board, aiPlayer, aiDifficulty, boardSize);
    const maxIndex = boardSize * boardSize;
    if (aiMove >= 0 && aiMove < maxIndex && board[aiMove] === null) {
      get().makeMove(aiMove);
    }
  },

  // Set multiplayer mode
  setMultiplayerMode: (enabled: boolean) => {
    if (enabled) {
      set({ gameMode: 'multiplayer' });
      // Setup multiplayer listeners
      multiplayerService.on('move', (data: { index: number; player: Player }) => {
        get().handleMultiplayerMove(data.index, data.player);
      });
      multiplayerService.on('reset', () => {
        get().resetGame();
      });
      multiplayerService.on('sync', (data: any) => {
        set({
          board: data.board || get().board,
          currentPlayer: data.currentPlayer || get().currentPlayer,
          winner: data.winner !== undefined ? data.winner : get().winner,
          isDraw: data.isDraw !== undefined ? data.isDraw : get().isDraw,
        });
      });
    } else {
      multiplayerService.disconnect();
      set({ gameMode: 'pvp' });
    }
  },

  // Handle multiplayer move from opponent
  handleMultiplayerMove: (index: number, player: Player) => {
    const state = get();
    if (state.gameMode === 'multiplayer' && state.currentPlayer === player) {
      get().makeMove(index);
    }
  },

  // Sync multiplayer state
  syncMultiplayerState: () => {
    const state = get();
    if (state.gameMode === 'multiplayer') {
      multiplayerService.sendSync(
        state.board,
        state.currentPlayer,
        state.winner,
        state.isDraw
      );
    }
  },

  // Set board size
  setBoardSize: (size: BoardSize) => {
    const currentState = get();
    
    // If switching away from 3×3 and AI mode is active, switch to PvP
    if (size !== 3 && currentState.gameMode === 'ai') {
      set({
        gameMode: 'pvp',
        aiPlayer: null,
      });
    }
    
    AsyncStorage.setItem(BOARD_SIZE_KEY, JSON.stringify(size));
    set({
      boardSize: size,
      board: getEmptyBoard(size),
      currentPlayer: 'X',
      winner: null,
      isDraw: false,
      gameStartTime: null,
    });
  },

  // Load board size from storage
  loadBoardSize: async () => {
    try {
      const boardSizeJson = await AsyncStorage.getItem(BOARD_SIZE_KEY);
      if (boardSizeJson) {
        const boardSize = JSON.parse(boardSizeJson) as BoardSize;
        set({
          boardSize,
          board: getEmptyBoard(boardSize),
        });
      }
    } catch (error) {
      // Ignore errors, use default size 3
    }
  },

  // Set marker theme
  setMarkerTheme: async (theme: MarkerThemeId) => {
    try {
      await AsyncStorage.setItem(MARKER_THEME_KEY, JSON.stringify(theme));
      set({ markerTheme: theme });
    } catch (error) {
      console.log('Error saving marker theme:', error);
    }
  },

  // Load marker theme from storage
  loadMarkerTheme: async () => {
    try {
      const themeJson = await AsyncStorage.getItem(MARKER_THEME_KEY);
      if (themeJson) {
        const theme = JSON.parse(themeJson) as MarkerThemeId;
        set({ markerTheme: theme });
      }
    } catch (error) {
      console.log('Error loading marker theme:', error);
    }
  },
}));
