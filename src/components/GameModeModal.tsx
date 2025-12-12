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
import { GameMode } from '../types/game';
import { AIDifficulty } from '../utils/aiPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GameModeModalProps {
  visible: boolean;
  onClose: () => void;
  currentMode: GameMode;
  currentDifficulty: AIDifficulty;
  boardSize: number;
  onSelectMode: (mode: GameMode, difficulty?: AIDifficulty, humanPlayer?: 'X' | 'O') => void;
}

const GAME_MODE_KEY = '@tictactoe_game_mode';
const AI_DIFFICULTY_KEY = '@tictactoe_ai_difficulty';

export const GameModeModal: React.FC<GameModeModalProps> = ({
  visible,
  onClose,
  currentMode,
  currentDifficulty,
  boardSize,
  onSelectMode,
}) => {
  const { theme } = useTheme();
  const [selectedMode, setSelectedMode] = useState<GameMode>(currentMode);
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>(currentDifficulty);
  const [selectedPlayer, setSelectedPlayer] = useState<'X' | 'O'>('X');

  useEffect(() => {
    if (visible) {
      setSelectedMode(currentMode);
      setSelectedDifficulty(currentDifficulty);
    }
  }, [visible, currentMode, currentDifficulty]);

  const handleSelectMode = async (mode: GameMode) => {
    setSelectedMode(mode);
    if (mode === 'ai') {
      await AsyncStorage.setItem(GAME_MODE_KEY, JSON.stringify(mode));
      await AsyncStorage.setItem(AI_DIFFICULTY_KEY, JSON.stringify(selectedDifficulty));
      onSelectMode(mode, selectedDifficulty, selectedPlayer);
    } else {
      await AsyncStorage.setItem(GAME_MODE_KEY, JSON.stringify(mode));
      onSelectMode(mode);
    }
    onClose();
  };

  const handleSelectDifficulty = async (difficulty: AIDifficulty) => {
    setSelectedDifficulty(difficulty);
    if (selectedMode === 'ai') {
      await AsyncStorage.setItem(AI_DIFFICULTY_KEY, JSON.stringify(difficulty));
      onSelectMode(selectedMode, difficulty, selectedPlayer);
      onClose();
    }
  };

  const handleSelectPlayer = async (player: 'X' | 'O') => {
    setSelectedPlayer(player);
    if (selectedMode === 'ai') {
      await AsyncStorage.setItem(AI_DIFFICULTY_KEY, JSON.stringify(selectedDifficulty));
      onSelectMode(selectedMode, selectedDifficulty, player);
      onClose();
    }
  };

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
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 12,
      marginTop: 8,
    },
    modeOption: {
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
    },
    modeOptionSelected: {
      borderColor: theme.colors.buttonPrimary,
      borderWidth: 3,
      backgroundColor: theme.colors.modalBackground,
    },
    modeOptionDisabled: {
      opacity: 0.6,
      backgroundColor: theme.colors.boardBackground,
    },
    disabledText: {
      fontSize: 12,
      color: theme.colors.buttonDestructive,
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '600',
    },
    modeTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    modeDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    difficultyContainer: {
      marginTop: 16,
    },
    difficultyOption: {
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 10,
      padding: 16,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    difficultyOptionSelected: {
      borderColor: theme.colors.buttonPrimary,
      borderWidth: 3,
    },
    difficultyText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    difficultyDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    playerContainer: {
      marginTop: 16,
    },
    playerOption: {
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 10,
      padding: 16,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    playerOptionSelected: {
      borderColor: theme.colors.buttonPrimary,
      borderWidth: 3,
    },
    playerText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    checkmark: {
      fontSize: 20,
      color: theme.colors.buttonPrimary,
      fontWeight: 'bold',
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
          <Text style={styles.title}>Game Mode</Text>

          {/* Player vs Player */}
          <TouchableOpacity
            style={[
              styles.modeOption,
              selectedMode === 'pvp' && styles.modeOptionSelected,
            ]}
            onPress={() => handleSelectMode('pvp')}>
            <Text style={styles.modeTitle}>👥 Player vs Player</Text>
            <Text style={styles.modeDescription}>
              Play against a friend on the same device. Take turns making moves.
            </Text>
            {selectedMode === 'pvp' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          {/* Player vs AI */}
          <TouchableOpacity
            style={[
              styles.modeOption,
              selectedMode === 'ai' && boardSize === 3 && styles.modeOptionSelected,
              boardSize !== 3 && styles.modeOptionDisabled,
            ]}
            onPress={() => {
              if (boardSize === 3) {
                setSelectedMode('ai');
              } else {
                Alert.alert(
                  'AI Only for 3×3',
                  'AI opponent is only available for 3×3 board size. Please change the board size to 3×3 first.',
                  [{ text: 'OK' }]
                );
              }
            }}
            disabled={boardSize !== 3}>
            <Text style={styles.modeTitle}>🤖 Player vs AI</Text>
            <Text style={styles.modeDescription}>
              {boardSize === 3
                ? 'Play against an AI opponent. Choose your difficulty level and which player you want to be.'
                : 'AI is only available for 3×3 board size. Change board size to enable AI.'}
            </Text>
            {selectedMode === 'ai' && boardSize === 3 && (
              <Text style={styles.checkmark}>✓</Text>
            )}
            {boardSize !== 3 && (
              <Text style={styles.disabledText}>⚠️ 3×3 only</Text>
            )}
          </TouchableOpacity>

          {/* AI Difficulty Selection */}
          {selectedMode === 'ai' && boardSize === 3 && (
            <>
              <Text style={styles.sectionTitle}>AI Difficulty</Text>
              <View style={styles.difficultyContainer}>
                <TouchableOpacity
                  style={[
                    styles.difficultyOption,
                    selectedDifficulty === 'easy' && styles.difficultyOptionSelected,
                  ]}
                  onPress={() => handleSelectDifficulty('easy')}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.difficultyText}>🟢 Easy</Text>
                    <Text style={styles.difficultyDescription}>
                      Random moves - Great for beginners
                    </Text>
                  </View>
                  {selectedDifficulty === 'easy' && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.difficultyOption,
                    selectedDifficulty === 'medium' && styles.difficultyOptionSelected,
                  ]}
                  onPress={() => handleSelectDifficulty('medium')}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.difficultyText}>🟡 Medium</Text>
                    <Text style={styles.difficultyDescription}>
                      Mix of strategy and randomness - Balanced challenge
                    </Text>
                  </View>
                  {selectedDifficulty === 'medium' && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.difficultyOption,
                    selectedDifficulty === 'hard' && styles.difficultyOptionSelected,
                  ]}
                  onPress={() => handleSelectDifficulty('hard')}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.difficultyText}>🔴 Hard</Text>
                    <Text style={styles.difficultyDescription}>
                      Perfect play - Nearly impossible to beat
                    </Text>
                  </View>
                  {selectedDifficulty === 'hard' && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Player Selection - Only show if board size is 3×3 */}
              {boardSize === 3 && (
                <>
                  <Text style={styles.sectionTitle}>Choose Your Player</Text>
                  <View style={styles.playerContainer}>
                    <TouchableOpacity
                      style={[
                        styles.playerOption,
                        selectedPlayer === 'X' && styles.playerOptionSelected,
                      ]}
                      onPress={() => handleSelectPlayer('X')}>
                      <Text style={styles.playerText}>❌ Player X (Go First)</Text>
                      {selectedPlayer === 'X' && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.playerOption,
                        selectedPlayer === 'O' && styles.playerOptionSelected,
                      ]}
                      onPress={() => handleSelectPlayer('O')}>
                      <Text style={styles.playerText}>⭕ Player O (Go Second)</Text>
                      {selectedPlayer === 'O' && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

