import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BoardSize } from '../types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { internetMultiplayerService } from '../services/internetMultiplayerService';

interface BoardSizeModalProps {
  visible: boolean;
  onClose: () => void;
  currentSize: BoardSize;
  onSelectSize: (size: BoardSize) => void;
}

const BOARD_SIZE_KEY = '@tictactoe_board_size';

export const BoardSizeModal: React.FC<BoardSizeModalProps> = ({
  visible,
  onClose,
  currentSize,
  onSelectSize,
}) => {
  const { theme } = useTheme();
  const [selectedSize, setSelectedSize] = useState<BoardSize>(currentSize);

  useEffect(() => {
    if (visible) {
      setSelectedSize(currentSize);
    }
  }, [visible, currentSize]);

  const handleSelectSize = async (size: BoardSize) => {
    // Check if internet multiplayer is active - lock to 3x3
    const internetState = internetMultiplayerService.getState();
    if ((internetState.status === 'connected' || internetState.status === 'connecting') && size !== 3) {
      Alert.alert(
        'Board Size Locked',
        'Board size is locked to 3×3 during internet multiplayer games. Please disconnect from internet multiplayer to change the board size.'
      );
      return;
    }
    
    setSelectedSize(size);
    await AsyncStorage.setItem(BOARD_SIZE_KEY, JSON.stringify(size));
    onSelectSize(size);
    onClose();
  };

  const boardSizes: { size: BoardSize; label: string; description: string }[] = [
    {
      size: 3,
      label: '3×3',
      description: 'Classic Tic Tac Toe - Get 3 in a row',
    },
    {
      size: 4,
      label: '4×4',
      description: 'Medium challenge - Get 4 in a row',
    },
    {
      size: 5,
      label: '5×5',
      description: 'Hard challenge - Get 5 in a row',
    },
  ];

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.modalBackground,
      borderRadius: 20,
      padding: 24,
      width: Dimensions.get('window').width * 0.9,
      maxHeight: Dimensions.get('window').height * 0.8,
      borderWidth: 2,
      borderColor: theme.colors.modalBorder,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 24,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    sizeOption: {
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
    },
    sizeOptionSelected: {
      borderColor: theme.colors.buttonPrimary,
      borderWidth: 3,
      backgroundColor: theme.colors.modalBackground,
    },
    sizeLabel: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    sizeDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    checkmark: {
      fontSize: 20,
      color: theme.colors.buttonPrimary,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 8,
    },
    closeButton: {
      backgroundColor: theme.colors.buttonSecondary,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 20,
      marginBottom: 40,
      alignItems: 'center',
    },
    closeButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.modalContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Board Size</Text>
          <Text style={styles.subtitle}>
            Choose the size of the game board
          </Text>

          {boardSizes.map((boardSize) => {
            const internetState = internetMultiplayerService.getState();
            const isInternetActive = internetState.status === 'connected' || internetState.status === 'connecting';
            const isLocked = isInternetActive && boardSize.size !== 3;
            
            return (
              <TouchableOpacity
                key={boardSize.size}
                style={[
                  styles.sizeOption,
                  selectedSize === boardSize.size && styles.sizeOptionSelected,
                  isLocked && { opacity: 0.5 },
                ]}
                onPress={() => handleSelectSize(boardSize.size)}
                disabled={isLocked}>
                <Text style={styles.sizeLabel}>
                  {boardSize.label}
                  {isLocked && ' (Locked)'}
                </Text>
                <Text style={styles.sizeDescription}>{boardSize.description}</Text>
                {selectedSize === boardSize.size && (
                  <Text style={styles.checkmark}>✓ Selected</Text>
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

