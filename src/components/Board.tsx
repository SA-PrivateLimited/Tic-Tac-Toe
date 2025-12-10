import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Cell } from './Cell';
import { Player } from '../types/game';
import { getWinningLine } from '../utils/gameLogic';

interface BoardProps {
  board: Player[];
  onCellPress: (index: number) => void;
  disabled: boolean;
}

export const Board: React.FC<BoardProps> = ({ board, onCellPress, disabled }) => {
  const winningLine = getWinningLine(board);

  // Split board into rows of 3
  const rows = [];
  for (let i = 0; i < 9; i += 3) {
    rows.push(board.slice(i, i + 3));
  }

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, rowIndex === 2 && styles.lastRow]}>
            {row.map((cell, colIndex) => {
              const index = rowIndex * 3 + colIndex;
              return (
                <Cell
                  key={index}
                  value={cell}
                  onPress={() => onCellPress(index)}
                  disabled={disabled || cell !== null}
                  isWinning={winningLine?.includes(index) || false}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  board: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2.5,
    borderColor: '#2a2a3e',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  lastRow: {
    marginBottom: 0,
  },
});
