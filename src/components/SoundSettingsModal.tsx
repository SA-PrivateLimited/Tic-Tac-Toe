import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Instrument } from '../types/sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import sound manager with error handling
let setInstrument: ((instrument: Instrument) => void) = () => {};
let getInstrument: (() => Instrument) = () => 'piano';

try {
  const soundModule = require('../utils/soundManager');
  if (soundModule && soundModule.setInstrument) {
    setInstrument = soundModule.setInstrument;
  }
  if (soundModule && soundModule.getInstrument) {
    getInstrument = soundModule.getInstrument;
  }
} catch (error) {
  console.log('Sound module not available:', error);
}

const INSTRUMENT_KEY = '@tictactoe_instrument';

interface SoundSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const instruments: { key: Instrument; label: string; emoji: string }[] = [
  { key: 'piano', label: 'Piano', emoji: '🎹' },
  { key: 'guitar', label: 'Guitar', emoji: '🎸' },
  { key: 'drums', label: 'Drums', emoji: '🥁' },
  { key: 'synth', label: 'Synthesizer', emoji: '🎹' },
  { key: 'bell', label: 'Bell', emoji: '🔔' },
  { key: 'none', label: 'No Sound', emoji: '🔇' },
];

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('piano');

  useEffect(() => {
    if (visible) {
      loadInstrument();
    }
  }, [visible]);

  const loadInstrument = async () => {
    try {
      const saved = await AsyncStorage.getItem(INSTRUMENT_KEY);
      if (saved) {
        const instrument = JSON.parse(saved) as Instrument;
        setSelectedInstrument(instrument);
        setInstrument(instrument);
      } else {
        setSelectedInstrument('piano');
        setInstrument('piano');
      }
    } catch (error) {
      setSelectedInstrument('piano');
      setInstrument('piano');
    }
  };

  const handleSelectInstrument = async (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    
    // Set instrument immediately to test sound
    setInstrument(instrument);
    
    // Play a test sound when selecting (except for 'none')
    if (instrument !== 'none') {
      setTimeout(() => {
        try {
          const { playMoveSound } = require('../utils/soundManager');
          if (playMoveSound) {
            console.log(`🎵 Testing ${instrument} sound...`);
            playMoveSound();
          } else {
            console.log('❌ playMoveSound function not found');
          }
        } catch (error) {
          console.log('❌ Error loading sound manager:', error);
        }
      }, 500); // Increased delay to allow sound to initialize
    }
    
    // Save preference
    try {
      await AsyncStorage.setItem(INSTRUMENT_KEY, JSON.stringify(instrument));
      console.log(`✅ Saved instrument preference: ${instrument}`);
    } catch (error) {
      console.log('Error saving instrument preference:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Choose Sound Instrument</Text>
          <Text style={styles.subtitle}>
            Select your preferred sound for game moves
          </Text>

          <ScrollView style={styles.instrumentsList} showsVerticalScrollIndicator={false}>
            {instruments.map((instrument) => (
              <TouchableOpacity
                key={instrument.key}
                style={[
                  styles.instrumentItem,
                  selectedInstrument === instrument.key && styles.selectedInstrument,
                ]}
                onPress={() => handleSelectInstrument(instrument.key)}
              >
                <Text style={styles.emoji}>{instrument.emoji}</Text>
                <Text
                  style={[
                    styles.instrumentLabel,
                    selectedInstrument === instrument.key && styles.selectedLabel,
                  ]}
                >
                  {instrument.label}
                </Text>
                {selectedInstrument === instrument.key && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
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
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 3,
    borderColor: '#3a4a6a',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fffffe',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: '#e94560',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#b8b9c4',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  instrumentsList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  instrumentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0e17',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2a3a5a',
  },
  selectedInstrument: {
    backgroundColor: '#1a237e',
    borderColor: '#4ecca3',
    borderWidth: 3,
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  instrumentLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fffffe',
    letterSpacing: 0.5,
  },
  selectedLabel: {
    color: '#4ecca3',
    fontWeight: '800',
  },
  checkmark: {
    fontSize: 24,
    color: '#4ecca3',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

