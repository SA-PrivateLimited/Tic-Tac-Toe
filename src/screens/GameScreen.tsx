import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Dimensions } from 'react-native';
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
import { GameModeModal } from '../components/GameModeModal';
import { MultiplayerModal } from '../components/MultiplayerModal';
import { BoardSizeModal } from '../components/BoardSizeModal';
import { MarkerModal } from '../components/MarkerModal';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../theme/ThemeContext';
import { isAITurn } from '../utils/aiPlayer';
import { multiplayerService } from '../services/multiplayerService';
import { internetMultiplayerService } from '../services/internetMultiplayerService';
import { Player } from '../types/game';

export const GameScreen: React.FC = () => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth >= 600;
  const buttonWidth = isTablet ? (screenWidth - 80) / 4 : (screenWidth - 64) / 3; // 4 columns on tablet, 3 on mobile
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
    // AI system state and methods
    gameMode,
    aiDifficulty,
    aiPlayer,
    humanPlayer,
    setGameMode,
    // Multiplayer system methods
    setMultiplayerMode,
    handleMultiplayerMove,
    syncMultiplayerState,
    // Board size methods
    boardSize,
    setBoardSize,
    loadBoardSize,
    // Marker theme methods
    loadMarkerTheme,
    // Game state persistence methods
    saveGameState,
    loadGameState,
  } = useGameStore();

  const [showResetBalancesModal, setShowResetBalancesModal] = useState(false);
  const [showSoundSettingsModal, setShowSoundSettingsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [showGameModeModal, setShowGameModeModal] = useState(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showBoardSizeModal, setShowBoardSizeModal] = useState(false);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [showResetGameModal, setShowResetGameModal] = useState(false);

  useEffect(() => {
    // Load scores, balances, achievements, statistics, board size, and game state from AsyncStorage on mount
    loadScores();
    loadBalances();
    loadAchievements();
    loadStatistics();
    loadBoardSize();
    loadMarkerTheme();
    // Only load game state for non-multiplayer modes
    // In multiplayer, state is synced via network, not local storage
    if (gameMode !== 'multiplayer') {
      loadGameState();
    } // Load current game state (board, currentPlayer, etc.)
  }, []);

  const getStatusMessage = () => {
    if (winner) {
      if (gameMode === 'ai' && winner === humanPlayer) {
        return 'You Win! 🎉';
      } else if (gameMode === 'ai' && winner === aiPlayer) {
        return 'AI Wins! 🤖';
      } else if (gameMode === 'multiplayer') {
        const wifiState = multiplayerService.getState();
        const internetState = internetMultiplayerService.getState();
        let myPlayer: Player = 'X';
        
        if (wifiState.status === 'connected') {
          myPlayer = multiplayerService.getMyPlayer();
        } else if (internetState.status === 'connected') {
          myPlayer = internetMultiplayerService.getMyPlayer();
        }
        
        if (winner === myPlayer) {
          return 'You Win! 🎉';
        } else {
          return 'Opponent Wins!';
        }
      }
      return `Player ${winner} Wins!`;
    }
    if (isDraw) {
      return "It's a Draw!";
    }
    if (gameMode === 'ai' && isAITurn(currentPlayer, aiPlayer)) {
      return 'AI is thinking...';
    } else if (gameMode === 'ai' && currentPlayer === humanPlayer) {
      return 'Your Turn';
    } else if (gameMode === 'multiplayer') {
      const wifiState = multiplayerService.getState();
      const internetState = internetMultiplayerService.getState();
      let myPlayer: Player = 'X';
      let isMyTurn = false;
      
      if (wifiState.status === 'connected') {
        myPlayer = multiplayerService.getMyPlayer();
        isMyTurn = multiplayerService.isMyTurn();
      } else if (internetState.status === 'connected') {
        myPlayer = internetMultiplayerService.getMyPlayer();
        isMyTurn = internetMultiplayerService.isMyTurn();
      }
      
      if (currentPlayer === myPlayer && isMyTurn) {
        return 'Your Turn';
      } else {
        return 'Waiting for opponent...';
      }
    }
    return `Player ${currentPlayer}'s Turn`;
  };

  const isGameOver = winner !== null || isDraw;
  const isAITurnNow = gameMode === 'ai' && isAITurn(currentPlayer, aiPlayer);
  
  // Check if it's opponent's turn in multiplayer
  let isMultiplayerTurn = false;
  if (gameMode === 'multiplayer') {
    const wifiState = multiplayerService.getState();
    const internetState = internetMultiplayerService.getState();
    let myPlayer: Player = 'X';
    
    if (wifiState.status === 'connected') {
      myPlayer = multiplayerService.getMyPlayer();
      isMultiplayerTurn = !multiplayerService.isMyTurn();
    } else if (internetState.status === 'connected') {
      myPlayer = internetMultiplayerService.getMyPlayer();
      isMultiplayerTurn = !internetMultiplayerService.isMyTurn();
    } else {
      isMultiplayerTurn = currentPlayer !== myPlayer;
    }
  }

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

  // Handler for New Game button
  const handleNewGame = () => {
    // In multiplayer mode, if game is not over, show confirmation modal
    if (gameMode === 'multiplayer' && winner === null && !isDraw) {
      setShowResetGameModal(true);
    } else {
      // Game is over or not multiplayer - reset immediately
      resetGame();
    }
  };

  const handleConfirmResetGame = () => {
    resetGame();
    setShowResetGameModal(false);
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
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 8,
    },
    status: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textAlign: 'left',
      flex: 1,
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
      marginTop: 24,
      marginBottom: 16,
    },
    button: {
      backgroundColor: theme.colors.buttonPrimary,
      paddingVertical: 20,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginHorizontal: 8,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 100,
      maxWidth: 150,
      overflow: 'hidden',
    },
    resetButton: {
      backgroundColor: theme.colors.buttonDestructive,
    },
    bottomButtonContainer: {
      width: '100%',
      paddingHorizontal: 12,
      marginTop: 12,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    setBetButton: {
      backgroundColor: theme.colors.buttonSecondary,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    soundButton: {
      backgroundColor: theme.colors.buttonPrimary,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    themeButton: {
      backgroundColor: theme.colors.playerO,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    gameModeButton: {
      backgroundColor: theme.colors.buttonPrimary,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    multiplayerButton: {
      backgroundColor: theme.colors.buttonPrimary,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    boardSizeButton: {
      backgroundColor: theme.colors.buttonSecondary,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    achievementsButton: {
      backgroundColor: theme.colors.playerX,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    statisticsButton: {
      backgroundColor: theme.colors.buttonPrimary,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    buttonText: {
      color: theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: 0.8,
      marginTop: 6,
      textTransform: 'uppercase',
      opacity: 0.95,
    },
    buttonIcon: {
      fontSize: 36,
      marginBottom: 6,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    buttonDisabled: {
      opacity: 0.5,
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
    helpSupport: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 12,
      textAlign: 'center',
      opacity: 0.7,
      lineHeight: 18,
    },
    contactLink: {
      color: theme.colors.buttonPrimary,
      fontWeight: '600',
    },
    connectionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
      marginLeft: 12,
    },
    connectionBadgeWifi: {
      backgroundColor: '#4CAF50',
      borderColor: '#2E7D32',
    },
    connectionBadgeInternet: {
      backgroundColor: '#4CAF50',
      borderColor: '#2E7D32',
    },
    connectionBadgeOffline: {
      backgroundColor: '#F44336',
      borderColor: '#C62828',
    },
    connectionBadgeIcon: {
      fontSize: 10,
      marginRight: 3,
    },
    connectionBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.3,
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

        {/* Status Message with Connection Badge */}
        <View style={styles.statusContainer}>
          <Text style={[
            styles.status,
            winner && styles.winnerStatus,
            isDraw && styles.drawStatus,
          ]}>
            {getStatusMessage()}
          </Text>

          {/* Connection Status Badge - Right Side (Clickable) - Always Show */}
          {(() => {
            const wifiState = multiplayerService.getState();
            const internetState = internetMultiplayerService.getState();
            let connectionType: 'wifi' | 'internet' | 'offline' = 'offline';

            // Check connection status regardless of game mode
            if (wifiState.status === 'connected') {
              connectionType = 'wifi';
            } else if (internetState.status === 'connected') {
              connectionType = 'internet';
            } else {
              connectionType = 'offline';
            }

            // Always show badge
            return (
              <TouchableOpacity
                style={[
                  styles.connectionBadge,
                  connectionType === 'wifi' && styles.connectionBadgeWifi,
                  connectionType === 'internet' && styles.connectionBadgeInternet,
                  connectionType === 'offline' && styles.connectionBadgeOffline,
                ]}
                onPress={() => setShowMultiplayerModal(true)}
                activeOpacity={0.7}>
                <Text style={styles.connectionBadgeIcon}>
                  {connectionType === 'wifi' ? '📶' : connectionType === 'internet' ? '🌐' : '📴'}
                </Text>
                <Text style={styles.connectionBadgeText}>
                  {connectionType === 'wifi' ? 'WiFi' : connectionType === 'internet' ? 'Internet' : 'Offline'}
                </Text>
              </TouchableOpacity>
            );
          })()}
        </View>

        <Board
          board={board}
          boardSize={boardSize}
          onCellPress={makeMove}
          disabled={isGameOver || isAITurnNow || isMultiplayerTurn}
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
          {/* Game Mode button */}
          <TouchableOpacity
            style={[styles.button, styles.gameModeButton, { width: buttonWidth }]}
            onPress={() => setShowGameModeModal(true)}
          >
            <Text style={styles.buttonIcon}>
              {gameMode === 'ai' ? '🤖' : gameMode === 'multiplayer' ? '🌐' : '👥'}
            </Text>
            <Text style={styles.buttonText}>
              {gameMode === 'ai' 
                ? `AI (${aiDifficulty})` 
                : gameMode === 'multiplayer'
                ? 'Multiplayer'
                : 'PvP'}
            </Text>
          </TouchableOpacity>

          {/* Multiplayer button */}
          <TouchableOpacity
            style={[styles.button, styles.multiplayerButton, { width: buttonWidth }]}
            onPress={() => setShowMultiplayerModal(true)}
          >
            <Text style={styles.buttonIcon}>🌐</Text>
            <Text style={styles.buttonText}>Play Online</Text>
          </TouchableOpacity>

          {/* Marker Theme button */}
          <TouchableOpacity
            style={[styles.button, styles.boardSizeButton, { width: buttonWidth }]}
            onPress={() => setShowMarkerModal(true)}
          >
            <Text style={styles.buttonIcon}>🎯</Text>
            <Text style={styles.buttonText}>Markers</Text>
          </TouchableOpacity>

          {/* Board Size button */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.boardSizeButton,
              { width: buttonWidth },
              (internetMultiplayerService.getState().status === 'connected' || 
               internetMultiplayerService.getState().status === 'connecting') && styles.buttonDisabled
            ]}
            onPress={() => {
              // Prevent board size change during internet multiplayer
              const internetState = internetMultiplayerService.getState();
              if (internetState.status === 'connected' || internetState.status === 'connecting') {
                return; // Disabled during internet multiplayer
              }
              setShowBoardSizeModal(true);
            }}
            disabled={internetMultiplayerService.getState().status === 'connected' || 
                     internetMultiplayerService.getState().status === 'connecting'}
          >
            <Text style={styles.buttonIcon}>📐</Text>
            <Text style={styles.buttonText}>
              {boardSize}×{boardSize}
              {(internetMultiplayerService.getState().status === 'connected' || 
                internetMultiplayerService.getState().status === 'connecting') ? ' 🔒' : ''}
            </Text>
          </TouchableOpacity>

          {/* Set/Reset Bet Amount button */}
          <TouchableOpacity
            style={[styles.button, styles.setBetButton, { width: buttonWidth }]}
            onPress={handleSetBetAmount}
          >
            <Text style={styles.buttonIcon}>💰</Text>
            <Text style={styles.buttonText}>
              {betAmount > 0 ? `Points (${betAmount})` : 'Set Points'}
            </Text>
          </TouchableOpacity>

          {/* Sound Settings button */}
          <TouchableOpacity
            style={[styles.button, styles.soundButton, { width: buttonWidth }]}
            onPress={() => setShowSoundSettingsModal(true)}
          >
            <Text style={styles.buttonIcon}>🎵</Text>
            <Text style={styles.buttonText}>Sound</Text>
          </TouchableOpacity>

          {/* Theme button */}
          <TouchableOpacity
            style={[styles.button, styles.themeButton, { width: buttonWidth }]}
            onPress={() => setShowThemeModal(true)}
          >
            <Text style={styles.buttonIcon}>🎨</Text>
            <Text style={styles.buttonText}>Theme</Text>
          </TouchableOpacity>

          {/* Achievements button */}
          <TouchableOpacity
            style={[styles.button, styles.achievementsButton, { width: buttonWidth }]}
            onPress={() => setShowAchievementsModal(true)}
          >
            <Text style={styles.buttonIcon}>🏆</Text>
            <Text style={styles.buttonText}>Achievements</Text>
          </TouchableOpacity>

          {/* Statistics button */}
          <TouchableOpacity
            style={[styles.button, styles.statisticsButton, { width: buttonWidth }]}
            onPress={() => setShowStatisticsModal(true)}
          >
            <Text style={styles.buttonIcon}>📊</Text>
            <Text style={styles.buttonText}>Statistics</Text>
          </TouchableOpacity>
        </View>

        {/* Powered by credit */}
        <Text style={styles.poweredBy}>
          Powered by{' '}
          <Text style={styles.poweredByLink}>sa-privateLimited.com</Text>
        </Text>

        {/* Help and Support */}
        <Text style={styles.helpSupport}>
          Help & Support:{'\n'}
          <Text style={styles.contactLink}>support@sa-privatelimited.com</Text>
          {'\n'}
          <Text style={styles.contactLink}>+91 8210900726</Text>
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

      {/* Reset Game Confirmation Modal (for multiplayer during active game) */}
      <ConfirmModal
        visible={showResetGameModal}
        title="Reset Game?"
        message="This will reset the game board and start a new game. Your opponent will also see the reset. Continue?"
        confirmText="Reset Game"
        cancelText="Cancel"
        onConfirm={handleConfirmResetGame}
        onCancel={() => setShowResetGameModal(false)}
        confirmButtonStyle="default"
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

      {/* Game Mode Modal */}
      <GameModeModal
        visible={showGameModeModal}
        onClose={() => setShowGameModeModal(false)}
        currentMode={gameMode}
        currentDifficulty={aiDifficulty}
        boardSize={boardSize}
        onSelectMode={setGameMode}
      />

      {/* Multiplayer Modal */}
      <MultiplayerModal
        visible={showMultiplayerModal}
        onClose={() => {
          setShowMultiplayerModal(false);
          if (gameMode === 'multiplayer') {
            setMultiplayerMode(false);
          }
        }}
        onConnected={() => {
          setMultiplayerMode(true);
          setShowMultiplayerModal(false);
        }}
      />

      {/* Board Size Modal */}
      <BoardSizeModal
        visible={showBoardSizeModal}
        onClose={() => setShowBoardSizeModal(false)}
        currentSize={boardSize}
        onSelectSize={setBoardSize}
      />

      {/* Marker Modal */}
      <MarkerModal
        visible={showMarkerModal}
        onClose={() => setShowMarkerModal(false)}
      />
    </View>
  );
};
