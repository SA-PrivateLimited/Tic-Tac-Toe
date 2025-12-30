export type MarkerThemeId = 'classic' | 'fire-water' | 'deer-lion' | 'sun-moon' | 'cat-dog' | 'rocket-star';

export interface MarkerTheme {
  id: MarkerThemeId;
  name: string;
  playerX: {
    symbol: string;
    emoji: string;
    color?: string;
  };
  playerO: {
    symbol: string;
    emoji: string;
    color?: string;
  };
}

export const MARKER_THEMES: Record<MarkerThemeId, MarkerTheme> = {
  classic: {
    id: 'classic',
    name: 'Classic X & O',
    playerX: {
      symbol: 'X',
      emoji: '❌',
    },
    playerO: {
      symbol: 'O',
      emoji: '⭕',
    },
  },
  'fire-water': {
    id: 'fire-water',
    name: 'Fire & Water',
    playerX: {
      symbol: '🔥',
      emoji: '🔥',
    },
    playerO: {
      symbol: '💧',
      emoji: '💧',
    },
  },
  'deer-lion': {
    id: 'deer-lion',
    name: 'Deer & Lion',
    playerX: {
      symbol: '🦌',
      emoji: '🦌',
    },
    playerO: {
      symbol: '🦁',
      emoji: '🦁',
    },
  },
  'sun-moon': {
    id: 'sun-moon',
    name: 'Sun & Moon',
    playerX: {
      symbol: '☀️',
      emoji: '☀️',
    },
    playerO: {
      symbol: '🌙',
      emoji: '🌙',
    },
  },
  'cat-dog': {
    id: 'cat-dog',
    name: 'Cat & Dog',
    playerX: {
      symbol: '🐱',
      emoji: '🐱',
    },
    playerO: {
      symbol: '🐶',
      emoji: '🐶',
    },
  },
  'rocket-star': {
    id: 'rocket-star',
    name: 'Rocket & Star',
    playerX: {
      symbol: '🚀',
      emoji: '🚀',
    },
    playerO: {
      symbol: '⭐',
      emoji: '⭐',
    },
  },
};

export const DEFAULT_MARKER_THEME: MarkerThemeId = 'classic';

