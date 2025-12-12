import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Player } from '../types/game';
import { useTheme } from '../theme/ThemeContext';

interface CellProps {
  value: Player;
  onPress: () => void;
  disabled: boolean;
  isWinning: boolean;
  size?: number;
}

export const Cell: React.FC<CellProps> = ({ value, onPress, disabled, isWinning, size = 100 }) => {
  const { theme } = useTheme();
  
  // Calculate font size based on cell size
  const fontSize = Math.floor(size * 0.56);

  const styles = StyleSheet.create({
    cell: {
      width: size,
      height: size,
      marginRight: 8,
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2.5,
      borderColor: theme.colors.cellBorder,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    },
    winningCell: {
      backgroundColor: theme.colors.winningCell,
      borderColor: theme.colors.playerO,
      borderWidth: 3,
      shadowColor: theme.colors.playerO,
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 10,
      transform: [{ scale: 1.05 }],
    },
    cellText: {
      fontSize: fontSize,
      fontWeight: '800',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    xText: {
      color: theme.colors.playerX,
      textShadowColor: theme.colors.playerX,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
    oText: {
      color: theme.colors.playerO,
      textShadowColor: theme.colors.playerO,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
  });

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        isWinning && styles.winningCell,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.cellText,
        value === 'X' && styles.xText,
        value === 'O' && styles.oText,
      ]}>
        {value || ''}
      </Text>
    </TouchableOpacity>
  );
};
