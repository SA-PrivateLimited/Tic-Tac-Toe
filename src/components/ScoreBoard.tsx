import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreBoardProps {
  xScore: number;
  oScore: number;
  draws: number;
  // Betting system props
  xBalance: number;
  oBalance: number;
  betAmount: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  xScore,
  oScore,
  draws,
  xBalance,
  oBalance,
  betAmount,
}) => {
  return (
    <View>
      {/* Display current points if set */}
      {betAmount > 0 && (
        <View style={styles.betContainer}>
          <Text style={styles.betLabel}>Current Points</Text>
          <Text style={styles.betAmount}>{betAmount} Pts</Text>
        </View>
      )}

      {/* Player balances row */}
      <View style={styles.balanceContainer}>
          <View style={styles.balanceItem}>
            <Text style={[styles.balanceLabel, styles.xColor]}>Player X Points</Text>
            <Text style={[styles.balanceValue, styles.xColor]}>{xBalance} Pts</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={[styles.balanceLabel, styles.oColor]}>Player O Points</Text>
            <Text style={[styles.balanceValue, styles.oColor]}>{oBalance} Pts</Text>
          </View>
      </View>

      {/* Scores row */}
      <View style={styles.container}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, styles.xColor]}>Player X</Text>
          <Text style={[styles.scoreValue, styles.xColor]}>{xScore}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Draws</Text>
          <Text style={styles.scoreValue}>{draws}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, styles.oColor]}>Player O</Text>
          <Text style={[styles.scoreValue, styles.oColor]}>{oScore}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Bet amount display
  betContainer: {
    alignSelf: 'center',
    backgroundColor: '#e94560',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  betLabel: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  betAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Player balances
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0f0e17',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#2a3a5a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 9,
    color: '#888',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Score display
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  scoreItem: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#2a3a5a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  xColor: {
    color: '#e94560',
  },
  oColor: {
    color: '#4ecca3',
  },
});
