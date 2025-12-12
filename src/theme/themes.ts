import { Theme, ThemeId } from '../types/theme';

export const THEMES: Record<ThemeId, Theme> = {
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      // Background colors
      background: '#0a0a0f',
      boardBackground: '#1a1a2e',
      cellBackground: '#16213e',
      cellBorder: '#2a3a5a',

      // Text colors
      textPrimary: '#fffffe',
      textSecondary: '#b8b9c4',

      // Player colors
      playerX: '#e94560',
      playerO: '#4ecca3',

      // Button colors
      buttonPrimary: '#e94560',
      buttonSecondary: '#9b59b6',
      buttonDestructive: '#ff6b35',

      // Game state colors
      winningCell: '#2a9d8f',

      // Modal colors
      modalBackground: '#1a1a2e',
      modalBorder: '#3a4a6a',
      modalOverlay: 'rgba(0, 0, 0, 0.9)',

      // Shadow/effects
      shadowColor: '#e94560',
    },
  },

  light: {
    id: 'light',
    name: 'Light Mode',
    colors: {
      // Background colors
      background: '#f8f9fa',
      boardBackground: '#ffffff',
      cellBackground: '#f1f3f5',
      cellBorder: '#dee2e6',

      // Text colors
      textPrimary: '#212529',
      textSecondary: '#6c757d',

      // Player colors
      playerX: '#dc3545',
      playerO: '#20c997',

      // Button colors
      buttonPrimary: '#0d6efd',
      buttonSecondary: '#6c757d',
      buttonDestructive: '#dc3545',

      // Game state colors
      winningCell: '#28a745',

      // Modal colors
      modalBackground: '#ffffff',
      modalBorder: '#dee2e6',
      modalOverlay: 'rgba(0, 0, 0, 0.7)',

      // Shadow/effects
      shadowColor: '#000000',
    },
  },

  neon: {
    id: 'neon',
    name: 'Neon Mode',
    colors: {
      // Background colors
      background: '#000000',
      boardBackground: '#0a0a0a',
      cellBackground: '#1a1a1a',
      cellBorder: '#ff00ff',

      // Text colors
      textPrimary: '#00ffff',
      textSecondary: '#ff00ff',

      // Player colors
      playerX: '#ff0080',
      playerO: '#00ff00',

      // Button colors
      buttonPrimary: '#ff00ff',
      buttonSecondary: '#00ffff',
      buttonDestructive: '#ff0000',

      // Game state colors
      winningCell: '#ffff00',

      // Modal colors
      modalBackground: '#0a0a0a',
      modalBorder: '#00ffff',
      modalOverlay: 'rgba(0, 0, 0, 0.95)',

      // Shadow/effects
      shadowColor: '#ff00ff',
    },
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean Mode',
    colors: {
      // Background colors
      background: '#0f172a',
      boardBackground: '#1e293b',
      cellBackground: '#334155',
      cellBorder: '#475569',

      // Text colors
      textPrimary: '#f0f9ff',
      textSecondary: '#bae6fd',

      // Player colors
      playerX: '#06b6d4',
      playerO: '#f97316',

      // Button colors
      buttonPrimary: '#0ea5e9',
      buttonSecondary: '#6366f1',
      buttonDestructive: '#f59e0b',

      // Game state colors
      winningCell: '#10b981',

      // Modal colors
      modalBackground: '#1e293b',
      modalBorder: '#475569',
      modalOverlay: 'rgba(15, 23, 42, 0.9)',

      // Shadow/effects
      shadowColor: '#06b6d4',
    },
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset Mode',
    colors: {
      // Background colors
      background: '#1a0b2e',
      boardBackground: '#2d1b3d',
      cellBackground: '#3d2b4d',
      cellBorder: '#6b4f8a',

      // Text colors
      textPrimary: '#fff5eb',
      textSecondary: '#ffc09f',

      // Player colors
      playerX: '#ff6b9d',
      playerO: '#f9844a',

      // Button colors
      buttonPrimary: '#f9844a',
      buttonSecondary: '#c060a1',
      buttonDestructive: '#f72585',

      // Game state colors
      winningCell: '#ffbe0b',

      // Modal colors
      modalBackground: '#2d1b3d',
      modalBorder: '#6b4f8a',
      modalOverlay: 'rgba(26, 11, 46, 0.9)',

      // Shadow/effects
      shadowColor: '#f9844a',
    },
  },
};

// Helper function to get theme by ID
export const getTheme = (themeId: ThemeId): Theme => {
  return THEMES[themeId];
};

// Default theme
export const DEFAULT_THEME: ThemeId = 'dark';
