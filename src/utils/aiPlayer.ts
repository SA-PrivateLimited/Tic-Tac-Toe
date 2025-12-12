import { Player, Board, BoardSize } from '../types/game';
import { checkWinner, checkDraw } from './gameLogic';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Get all available moves (empty cells) on the board
 */
const getAvailableMoves = (board: Board): number[] => {
  return board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index): index is number => index !== null);
};

/**
 * Check if a move would result in a win
 */
const isWinningMove = (board: Board, player: Player, move: number, boardSize: BoardSize = 3): boolean => {
  const newBoard = [...board];
  newBoard[move] = player;
  return checkWinner(newBoard, boardSize) === player;
};

/**
 * Check if a move would block opponent from winning
 */
const isBlockingMove = (board: Board, player: Player, move: number, boardSize: BoardSize = 3): boolean => {
  const opponent: Player = player === 'X' ? 'O' : 'X';
  return isWinningMove(board, opponent, move, boardSize);
};

/**
 * Minimax algorithm for optimal play
 */
const minimax = (
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  boardSize: BoardSize
): number => {
  const winner = checkWinner(board, boardSize);
  const opponent: Player = aiPlayer === 'X' ? 'O' : 'X';

  if (winner === aiPlayer) {
    return 10 - depth; // Prefer faster wins
  }
  if (winner === opponent) {
    return depth - 10; // Prefer slower losses
  }
  if (checkDraw(board, boardSize)) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    const availableMoves = getAvailableMoves(board);
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = aiPlayer;
      const score = minimax(newBoard, depth + 1, false, aiPlayer, boardSize);
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    const availableMoves = getAvailableMoves(board);
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = opponent;
      const score = minimax(newBoard, depth + 1, true, aiPlayer, boardSize);
      bestScore = Math.min(bestScore, score);
    }
    return bestScore;
  }
};

/**
 * Get the best move using minimax
 */
const getBestMove = (board: Board, aiPlayer: Player, boardSize: BoardSize): number => {
  let bestScore = -Infinity;
  let bestMove = -1;
  const availableMoves = getAvailableMoves(board);

  for (const move of availableMoves) {
    const newBoard = [...board];
    newBoard[move] = aiPlayer;
    const score = minimax(newBoard, 0, false, aiPlayer, boardSize);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

/**
 * Easy AI: Makes random moves
 */
const getEasyMove = (board: Board): number => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
};

/**
 * Medium AI: Mix of strategy and randomness
 * - 60% chance: Try to win or block
 * - 40% chance: Random move
 */
const getMediumMove = (board: Board, aiPlayer: Player, boardSize: BoardSize = 3): number => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;

  // 60% chance to use strategy
  if (Math.random() < 0.6) {
    // Try to win
    for (const move of availableMoves) {
      if (isWinningMove(board, aiPlayer, move, boardSize)) {
        return move;
      }
    }
    // Try to block
    for (const move of availableMoves) {
      if (isBlockingMove(board, aiPlayer, move, boardSize)) {
        return move;
      }
    }
    // Take center if available (for 3x3, 4x4, 5x5)
    const centerIndex = Math.floor((boardSize * boardSize) / 2);
    if (board[centerIndex] === null) {
      return centerIndex;
    }
    // Take corner if available (for 3x3)
    if (boardSize === 3) {
      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter(corner => board[corner] === null);
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }
    }
  }

  // 40% chance: Random move
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
};

/**
 * Hard AI: Uses minimax algorithm for optimal play
 */
const getHardMove = (board: Board, aiPlayer: Player, boardSize: BoardSize = 3): number => {
  return getBestMove(board, aiPlayer, boardSize);
};

/**
 * Get AI move based on difficulty level
 */
export const getAIMove = (
  board: Board,
  aiPlayer: Player,
  difficulty: AIDifficulty,
  boardSize: BoardSize = 3
): number => {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(board);
    case 'medium':
      return getMediumMove(board, aiPlayer, boardSize);
    case 'hard':
      return getHardMove(board, aiPlayer, boardSize);
    default:
      return getEasyMove(board);
  }
};

/**
 * Check if it's the AI's turn
 */
export const isAITurn = (
  currentPlayer: Player,
  aiPlayer: Player | null
): boolean => {
  return aiPlayer !== null && currentPlayer === aiPlayer;
};

