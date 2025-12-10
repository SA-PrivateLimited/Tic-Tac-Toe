import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Player } from '../types/game';

interface WinnerModalProps {
  visible: boolean;
  winner: Player;
  betAmount: number;
  newBalance: number;
  onClose: () => void;
}

// Component to display winner notification with betting results
export const WinnerModal: React.FC<WinnerModalProps> = ({
  visible,
  winner,
  betAmount,
  newBalance,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.trophy}>🏆</Text>

          <Text style={styles.title}>
            Player {winner} Wins!
          </Text>

              {betAmount > 0 && (
                <>
                  <View style={styles.winningsContainer}>
                    <Text style={styles.winningsLabel}>Points Earned</Text>
                    <Text style={styles.winningsAmount}>{betAmount} Pts</Text>
                  </View>

                  <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Total Points</Text>
                    <Text style={styles.balanceAmount}>{newBalance} Pts</Text>
                  </View>
                </>
              )}

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 28,
    padding: 40,
    width: '88%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4ecca3',
    shadowColor: '#4ecca3',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 20,
  },
  trophy: {
    fontSize: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#4ecca3',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: '#4ecca3',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  winningsContainer: {
    backgroundColor: '#0f0e17',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e94560',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  winningsLabel: {
    fontSize: 14,
    color: '#b8b9c4',
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  winningsAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#e94560',
    letterSpacing: 1.5,
    textShadowColor: '#e94560',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  balanceContainer: {
    backgroundColor: '#1a237e',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#3a4a7a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#b8b9c4',
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4ecca3',
    letterSpacing: 1.5,
    textShadowColor: '#4ecca3',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  button: {
    backgroundColor: '#e94560',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
