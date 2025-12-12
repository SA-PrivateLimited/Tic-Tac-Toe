import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface BetModalProps {
  visible: boolean;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
  currentBet?: number;
}

// Component to display betting input modal to set/reset bet amount
export const BetModal: React.FC<BetModalProps> = ({ visible, onConfirm, onCancel, currentBet = 0 }) => {
  const [betInput, setBetInput] = useState('');

  // Update input when modal opens with current bet
  useEffect(() => {
    if (visible) {
      setBetInput(currentBet > 0 ? currentBet.toString() : '');
    }
  }, [visible, currentBet]);

  const handleConfirm = () => {
    const amount = parseFloat(betInput);

    // Allow 0 to reset bet, or positive number
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number (0 or greater)');
      return;
    }

    onConfirm(amount);
    setBetInput(''); // Clear input after confirming
  };

  const handleCancel = () => {
    setBetInput(''); // Clear input on cancel
    onCancel();
  };

  const handleReset = () => {
    onConfirm(0);
    setBetInput('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {currentBet > 0 ? 'Change Points' : 'Set Points'}
          </Text>
          <Text style={styles.subtitle}>
            {currentBet > 0 
              ? `Current points: ${currentBet}. Enter 0 to remove points.`
              : 'The winner will receive these points. Enter 0 to play without points.'}
          </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>Pts</Text>
                <TextInput
                  style={styles.input}
                  value={betInput}
                  onChangeText={setBetInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                  autoFocus
                />
              </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            {currentBet > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={handleReset}
              >
                <Text style={styles.buttonText}>Reset to 0</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonText}>Set Points</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 28,
    padding: 36,
    width: '88%',
    maxWidth: 420,
    borderWidth: 3,
    borderColor: '#3a4a6a',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fffffe',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: '#e94560',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8b9c4',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0e17',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#e94560',
    paddingHorizontal: 20,
    marginBottom: 32,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4ecca3',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: '#fffffe',
    paddingVertical: 16,
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cancelButton: {
    backgroundColor: '#1a237e',
  },
  resetButton: {
    backgroundColor: '#ff6b35',
  },
  confirmButton: {
    backgroundColor: '#e94560',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
