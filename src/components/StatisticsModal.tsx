import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Statistics } from '../types/achievements';

interface StatisticsModalProps {
  visible: boolean;
  onClose: () => void;
  statistics: Statistics;
  onResetStatistics: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  visible,
  onClose,
  statistics,
  onResetStatistics,
}) => {
  const { theme } = useTheme();
  const [showConfirm, setShowConfirm] = useState(false);

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
      marginBottom: 20,
    },
    scrollContainer: {
      maxHeight: Dimensions.get('window').height * 0.55,
    },
    sectionCard: {
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 12,
      textAlign: 'center',
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.boardBackground,
    },
    statRowLast: {
      borderBottomWidth: 0,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    buttonContainer: {
      marginTop: 20,
    },
    resetButton: {
      backgroundColor: theme.colors.buttonDestructive,
      borderRadius: 12,
      paddingVertical: 14,
      marginBottom: 10,
      alignItems: 'center',
    },
    resetButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    closeButton: {
      backgroundColor: theme.colors.buttonSecondary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    closeButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: 'bold',
    },
    confirmContainer: {
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.buttonDestructive,
    },
    confirmText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 12,
    },
    confirmButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    confirmButton: {
      flex: 1,
      backgroundColor: theme.colors.buttonDestructive,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.buttonSecondary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    confirmButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleResetConfirm = () => {
    onResetStatistics();
    setShowConfirm(false);
  };

  const winRate = statistics.gamesPlayed > 0
    ? ((statistics.totalWins / statistics.gamesPlayed) * 100).toFixed(1)
    : '0.0';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Statistics</Text>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Game Overview */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Game Overview</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Games</Text>
                <Text style={styles.statValue}>{statistics.gamesPlayed}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Wins</Text>
                <Text style={styles.statValue}>{statistics.totalWins}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Draws</Text>
                <Text style={styles.statValue}>{statistics.totalDraws}</Text>
              </View>
              <View style={[styles.statRow, styles.statRowLast]}>
                <Text style={styles.statLabel}>Win Rate</Text>
                <Text style={styles.statValue}>{winRate}%</Text>
              </View>
            </View>

            {/* Player Stats */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Player Stats</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Player X Wins</Text>
                <Text style={styles.statValue}>{statistics.xWins}</Text>
              </View>
              <View style={[styles.statRow, styles.statRowLast]}>
                <Text style={styles.statLabel}>Player O Wins</Text>
                <Text style={styles.statValue}>{statistics.oWins}</Text>
              </View>
            </View>

            {/* Streaks */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Streaks</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Current Streak</Text>
                <Text style={styles.statValue}>{statistics.currentStreak}</Text>
              </View>
              <View style={[styles.statRow, styles.statRowLast]}>
                <Text style={styles.statLabel}>Longest Streak</Text>
                <Text style={styles.statValue}>{statistics.longestStreak}</Text>
              </View>
            </View>

            {/* Records */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Records</Text>
              <View style={[styles.statRow, styles.statRowLast]}>
                <Text style={styles.statLabel}>Fastest Win</Text>
                <Text style={styles.statValue}>{formatTime(statistics.fastestWin)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Confirmation Dialog */}
          {showConfirm && (
            <View style={styles.confirmContainer}>
              <Text style={styles.confirmText}>
                Are you sure you want to reset all statistics? This cannot be undone.
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleResetConfirm}>
                  <Text style={styles.confirmButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowConfirm(false)}>
                  <Text style={styles.confirmButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setShowConfirm(true)}>
              <Text style={styles.resetButtonText}>Reset Statistics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
