export type ThemeId = 'dark' | 'light' | 'neon' | 'ocean' | 'sunset';

export interface ThemeColors {
  // Background colors
  background: string;
  boardBackground: string;
  cellBackground: string;
  cellBorder: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;

  // Player colors
  playerX: string;
  playerO: string;

  // Button colors
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDestructive: string;

  // Game state colors
  winningCell: string;

  // Modal colors
  modalBackground: string;
  modalBorder: string;
  modalOverlay: string;

  // Shadow/effects
  shadowColor: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  colors: ThemeColors;
}

export interface AnimationConfig {
  winningLineEnabled: boolean;
  confettiEnabled: boolean;
  cellPulseEnabled: boolean;
  particleEffectsEnabled: boolean;
}
