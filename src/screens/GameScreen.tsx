import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Board } from '../components/Board';
import { ScoreBoard } from '../components/ScoreBoard';
import { BetModal } from '../components/BetModal';
import { WinnerModal } from '../components/WinnerModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useGameStore } from '../store/gameStore';

export const GameScreen: React.FC = () => {
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
  } = useGameStore();

  const [showResetBalancesModal, setShowResetBalancesModal] = useState(false);

  useEffect(() => {
    // Load scores and balances from AsyncStorage on mount
    loadScores();
    loadBalances();
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e17" />
      
      <View style={styles.content}>
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
              {betAmount > 0 ? `Change Bet (₹${betAmount})` : 'Set Bet'}
            </Text>
          </TouchableOpacity>

          {/* Reset Balances button */}
          <TouchableOpacity
            style={[styles.button, styles.resetBalancesButton]}
            onPress={handleResetBalances}
          >
            <Text style={styles.buttonText}>Reset Balances</Text>
          </TouchableOpacity>
        </View>
      </View>

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
        title="Reset Balances"
        message="Are you sure you want to reset both player balances to ₹0?"
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={handleConfirmResetBalances}
        onCancel={() => setShowResetBalancesModal(false)}
        confirmButtonStyle="destructive"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fffffe',
    marginBottom: 8,
    letterSpacing: 1.5,
    textShadowColor: '#e94560',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    textTransform: 'uppercase',
  },
  status: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b8b9c4',
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  winnerStatus: {
    color: '#4ecca3',
    fontSize: 24,
    fontWeight: '800',
    textShadowColor: '#4ecca3',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  drawStatus: {
    color: '#ffa500',
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: '#ffa500',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  bottomButtonContainer: {
    width: '100%',
    gap: 4,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#e94560',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButton: {
    backgroundColor: '#1a237e',
    shadowColor: '#1a237e',
  },
  setBetButton: {
    backgroundColor: '#9b59b6',
    minWidth: '100%',
    shadowColor: '#9b59b6',
  },
  resetBalancesButton: {
    backgroundColor: '#ff6b35',
    minWidth: '100%',
    shadowColor: '#ff6b35',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
