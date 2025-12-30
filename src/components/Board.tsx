import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Cell } from './Cell';
import { Player, BoardSize } from '../types/game';
import { getWinningLine } from '../utils/gameLogic';
import { useTheme } from '../theme/ThemeContext';

interface BoardProps {
  board: Player[];
  boardSize: BoardSize;
  onCellPress: (index: number) => void;
  disabled: boolean;
}

export const Board: React.FC<BoardProps> = ({ board, boardSize, onCellPress, disabled }) => {
  const { theme } = useTheme();
  const winningLine = getWinningLine(board, boardSize);

  // Split board into rows based on board size
  const rows = [];
  for (let i = 0; i < board.length; i += boardSize) {
    rows.push(board.slice(i, i + boardSize));
  }
  
  // Calculate cell size based on board size and screen width
  const screenWidth = Dimensions.get('window').width;
  const padding = 24; // Board padding
  const cellSpacing = 8; // Space between cells
  const availableWidth = screenWidth - padding * 2;
  const totalSpacing = cellSpacing * (boardSize - 1);
  const cellSize = Math.floor((availableWidth - totalSpacing) / boardSize);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 20,
    },
    board: {
      backgroundColor: theme.colors.boardBackground,
      borderRadius: 16,
      padding: 12,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 10,
      borderWidth: 2.5,
      borderColor: theme.colors.modalBorder,
    },
    row: {
      flexDirection: 'row',
      marginBottom: cellSpacing,
    },
    lastRow: {
      marginBottom: 0,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, rowIndex === rows.length - 1 && styles.lastRow]}>
            {row.map((cell, colIndex) => {
              const index = rowIndex * boardSize + colIndex;
              return (
          <Cell
            key={index}
            value={cell}
            onPress={() => onCellPress(index)}
            disabled={disabled || cell !== null}
            isWinning={winningLine?.includes(index) || false}
                  size={cellSize}
          />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};
