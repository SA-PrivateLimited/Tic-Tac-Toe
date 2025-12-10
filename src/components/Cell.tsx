import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Player } from '../types/game';

interface CellProps {
  value: Player;
  onPress: () => void;
  disabled: boolean;
  isWinning: boolean;
}

export const Cell: React.FC<CellProps> = ({ value, onPress, disabled, isWinning }) => {
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

const styles = StyleSheet.create({
  cell: {
    width: 100,
    height: 100,
    marginRight: 8,
    backgroundColor: '#16213e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#2a3a5a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  winningCell: {
    backgroundColor: '#2a9d8f',
    borderColor: '#4ecca3',
    borderWidth: 3,
    shadowColor: '#4ecca3',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
    transform: [{ scale: 1.05 }],
  },
  cellText: {
    fontSize: 56,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  xText: {
    color: '#e94560',
    textShadowColor: '#e94560',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  oText: {
    color: '#4ecca3',
    textShadowColor: '#4ecca3',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
