import { Player, Board, BoardSize } from '../types/game';

// Generate winning combinations for different board sizes
const generateWinningCombinations = (size: BoardSize): number[][] => {
  const combinations: number[][] = [];
  
  // Rows
  for (let row = 0; row < size; row++) {
    const combination: number[] = [];
    for (let col = 0; col < size; col++) {
      combination.push(row * size + col);
    }
    combinations.push(combination);
  }
  
  // Columns
  for (let col = 0; col < size; col++) {
    const combination: number[] = [];
    for (let row = 0; row < size; row++) {
      combination.push(row * size + col);
    }
    combinations.push(combination);
  }
  
  // Main diagonal (top-left to bottom-right)
  const mainDiagonal: number[] = [];
  for (let i = 0; i < size; i++) {
    mainDiagonal.push(i * size + i);
  }
  combinations.push(mainDiagonal);
  
  // Anti-diagonal (top-right to bottom-left)
  const antiDiagonal: number[] = [];
  for (let i = 0; i < size; i++) {
    antiDiagonal.push(i * size + (size - 1 - i));
  }
  combinations.push(antiDiagonal);
  
  return combinations;
};

// Cache winning combinations for each board size
const WINNING_COMBINATIONS_CACHE: { [key: number]: number[][] } = {
  3: generateWinningCombinations(3),
  4: generateWinningCombinations(4),
  5: generateWinningCombinations(5),
};

export const getWinningCombinations = (size: BoardSize): number[][] => {
  return WINNING_COMBINATIONS_CACHE[size] || WINNING_COMBINATIONS_CACHE[3];
};

export const checkWinner = (board: Board, boardSize: BoardSize = 3): Player => {
  const combinations = getWinningCombinations(boardSize);
  
  for (const combination of combinations) {
    if (combination.length === 0) continue;
    
    const firstCell = board[combination[0]];
    if (!firstCell) continue;
    
    // Check if all cells in the combination have the same player
    const allMatch = combination.every(index => board[index] === firstCell);
    if (allMatch) {
      return firstCell;
    }
  }
  
  return null;
};

export const checkDraw = (board: Board, boardSize: BoardSize = 3): boolean => {
  const totalCells = boardSize * boardSize;
  return board.length === totalCells && 
         board.every(cell => cell !== null) && 
         !checkWinner(board, boardSize);
};

export const getEmptyBoard = (boardSize: BoardSize = 3): Board => {
  return Array(boardSize * boardSize).fill(null);
};

export const getWinningLine = (board: Board, boardSize: BoardSize = 3): number[] | null => {
  const combinations = getWinningCombinations(boardSize);
  
  for (const combination of combinations) {
    if (combination.length === 0) continue;
    
    const firstCell = board[combination[0]];
    if (!firstCell) continue;
    
    // Check if all cells in the combination have the same player
    const allMatch = combination.every(index => board[index] === firstCell);
    if (allMatch) {
      return combination;
    }
  }
  
  return null;
};
