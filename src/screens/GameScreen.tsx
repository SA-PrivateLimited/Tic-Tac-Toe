import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Board } from '../components/Board';
import { ScoreBoard } from '../components/ScoreBoard';
import { BetModal } from '../components/BetModal';
import { WinnerModal } from '../components/WinnerModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { SoundSettingsModal } from '../components/SoundSettingsModal';
import { ThemeModal } from '../components/ThemeModal';
import { AchievementsModal } from '../components/AchievementsModal';
import { StatisticsModal } from '../components/StatisticsModal';
import { AchievementNotification } from '../components/AchievementNotification';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../theme/ThemeContext';

export const GameScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    board,
    currentPlayer,
    winner,
    isDraw,
    scores,
    makeMove,
    resetGame,
    resetScores,
    loadScores,
    // Betting system state and methods
    betAmount,
    playerBalances,
    showBetModal,
    showWinnerModal,
    setBetAmount,
    resetBalances,
    loadBalances,
    setShowBetModal,
    setShowWinnerModal,
    // Achievement system state and methods
    achievements,
    statistics,
    unlockedNotifications,
    loadAchievements,
    loadStatistics,
    dismissNotification,
    resetStatistics,
  } = useGameStore();

  const [showResetBalancesModal, setShowResetBalancesModal] = useState(false);
  const [showSoundSettingsModal, setShowSoundSettingsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);

  useEffect(() => {
    // Load scores, balances, achievements, and statistics from AsyncStorage on mount
    loadScores();
    loadBalances();
    loadAchievements();
    loadStatistics();
  }, []);

  const getStatusMessage = () => {
    if (winner) {
      return `Player ${winner} Wins!`;
    }
    if (isDraw) {
      return "It's a Draw!";
    }
    return `Player ${currentPlayer}'s Turn`;
  };

  const isGameOver = winner !== null || isDraw;

  // Handler for confirming bet amount
  const handleBetConfirm = (amount: number) => {
    setBetAmount(amount);
  };

  // Handler for canceling bet modal (keep current bet)
  const handleBetCancel = () => {
    setShowBetModal(false);
  };

  // Handler for opening bet modal to set/reset bet
  const handleSetBetAmount = () => {
    setShowBetModal(true);
  };

  // Handler for closing winner modal
  const handleWinnerModalClose = () => {
    setShowWinnerModal(false);
  };

  // Handler for resetting balances with confirmation
  const handleResetBalances = () => {
    setShowResetBalancesModal(true);
  };

  const handleConfirmResetBalances = () => {
    resetBalances();
    setShowResetBalancesModal(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 30,
      minHeight: '100%',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginBottom: 16,
      letterSpacing: 1.5,
      textShadowColor: theme.colors.buttonPrimary,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 10,
      textTransform: 'uppercase',
    },
    status: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginTop: 8,
      marginBottom: 8,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    winnerStatus: {
      color: theme.colors.playerO,
      fontSize: 20,
      fontWeight: '800',
    },
    drawStatus: {
      color: theme.colors.textSecondary,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingHorizontal: 16,
      marginTop: 20,
      marginBottom: 12,
    },
    button: {
      flex: 1,
      backgroundColor: theme.colors.buttonPrimary,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 10,
      marginHorizontal: 6,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    resetButton: {
      backgroundColor: theme.colors.buttonDestructive,
    },
    bottomButtonContainer: {
      width: '100%',
      paddingHorizontal: 16,
      marginTop: 8,
    },
    setBetButton: {
      backgroundColor: theme.colors.buttonSecondary,
      marginBottom: 10,
    },
    soundButton: {
      backgroundColor: theme.colors.buttonPrimary,
      marginBottom: 10,
    },
    themeButton: {
      backgroundColor: theme.colors.playerO,
      marginBottom: 10,
    },
    achievementsButton: {
      backgroundColor: theme.colors.playerX,
      marginBottom: 10,
    },
    statisticsButton: {
      backgroundColor: theme.colors.buttonPrimary,
      marginBottom: 10,
    },
    resetBalancesButton: {
      backgroundColor: theme.colors.buttonDestructive,
      marginBottom: 10,
    },
    buttonText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    poweredBy: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 20,
      textAlign: 'center',
      opacity: 0.6,
    },
    poweredByLink: {
      color: theme.colors.playerX,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e17" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Text style={styles.title}>Tic Tac Toe</Text>

        <ScoreBoard
          xScore={scores.X}
          oScore={scores.O}
          draws={scores.draws}
          xBalance={playerBalances.X}
          oBalance={playerBalances.O}
          betAmount={betAmount}
        />

        <Text style={[
          styles.status,
          winner && styles.winnerStatus,
          isDraw && styles.drawStatus,
        ]}>
          {getStatusMessage()}
        </Text>

        <Board
          board={board}
          onCellPress={makeMove}
          disabled={isGameOver}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={resetGame}
          >
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetScores}
          >
            <Text style={styles.buttonText}>Reset Scores</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomButtonContainer}>
          {/* Set/Reset Bet Amount button */}
          <TouchableOpacity
            style={[styles.button, styles.setBetButton]}
            onPress={handleSetBetAmount}
          >
            <Text style={styles.buttonText}>
              {betAmount > 0 ? `Change Points (${betAmount})` : 'Set Points'}
            </Text>
          </TouchableOpacity>

          {/* Sound Settings button */}
          <TouchableOpacity
            style={[styles.button, styles.soundButton]}
            onPress={() => setShowSoundSettingsModal(true)}
          >
            <Text style={styles.buttonText}>🎵 Sound Settings</Text>
          </TouchableOpacity>

          {/* Theme button */}
          <TouchableOpacity
            style={[styles.button, styles.themeButton]}
            onPress={() => setShowThemeModal(true)}
          >
            <Text style={styles.buttonText}>🎨 Theme</Text>
          </TouchableOpacity>

          {/* Achievements button */}
          <TouchableOpacity
            style={[styles.button, styles.achievementsButton]}
            onPress={() => setShowAchievementsModal(true)}
          >
            <Text style={styles.buttonText}>🏆 Achievements</Text>
          </TouchableOpacity>

          {/* Statistics button */}
          <TouchableOpacity
            style={[styles.button, styles.statisticsButton]}
            onPress={() => setShowStatisticsModal(true)}
          >
            <Text style={styles.buttonText}>📊 Statistics</Text>
          </TouchableOpacity>

          {/* Reset Balances button */}
          <TouchableOpacity
            style={[styles.button, styles.resetBalancesButton]}
            onPress={handleResetBalances}
          >
            <Text style={styles.buttonText}>Reset Points</Text>
          </TouchableOpacity>
        </View>

        {/* Powered by credit */}
        <Text style={styles.poweredBy}>
          Powered by{' '}
          <Text style={styles.poweredByLink}>sa-privateLimited.com</Text>
        </Text>
      </ScrollView>

      {/* Betting Modal - shown when user wants to set/reset bet */}
      <BetModal
        visible={showBetModal}
        onConfirm={handleBetConfirm}
        onCancel={handleBetCancel}
        currentBet={betAmount}
      />

      {/* Winner Modal - shown when a player wins with betting active */}
      <WinnerModal
        visible={showWinnerModal}
        winner={winner}
        betAmount={betAmount}
        newBalance={winner ? playerBalances[winner] : 0}
        onClose={handleWinnerModalClose}
      />

      {/* Reset Balances Confirmation Modal */}
      <ConfirmModal
        visible={showResetBalancesModal}
        title="Reset Points"
        message="Are you sure you want to reset both player points to 0?"
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={handleConfirmResetBalances}
        onCancel={() => setShowResetBalancesModal(false)}
        confirmButtonStyle="destructive"
      />

      {/* Sound Settings Modal */}
      <SoundSettingsModal
        visible={showSoundSettingsModal}
        onClose={() => setShowSoundSettingsModal(false)}
      />

      {/* Theme Modal */}
      <ThemeModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        visible={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        achievements={achievements}
      />

      {/* Statistics Modal */}
      <StatisticsModal
        visible={showStatisticsModal}
        onClose={() => setShowStatisticsModal(false)}
        statistics={statistics}
        onResetStatistics={resetStatistics}
      />

      {/* Achievement Notification */}
      <AchievementNotification
        notification={unlockedNotifications[0] || null}
        onDismiss={dismissNotification}
      />
    </View>
  );
};
