import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeId } from '../types/theme';
import { THEMES, DEFAULT_THEME } from './themes';

interface ThemeContextType {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@tictactoe_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme) as ThemeId;
        if (THEMES[parsedTheme]) {
          setThemeId(parsedTheme);
        }
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newThemeId: ThemeId) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newThemeId));
      setThemeId(newThemeId);
      console.log(`✅ Theme changed to: ${newThemeId}`);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const value: ThemeContextType = {
    theme: THEMES[themeId],
    themeId,
    setTheme,
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
