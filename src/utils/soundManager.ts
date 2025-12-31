import { Platform, NativeModules } from 'react-native';
import { Instrument } from '../types/sound';
import { Player } from '../types/game';

// Sound system using native Android MediaPlayer for WAV files
let SoundPlayerModule: any = null;
try {
  SoundPlayerModule = NativeModules.SoundPlayerModule;
} catch (e) {
  // SoundPlayerModule not available
}

// Sound file names mapping for instruments
const soundFiles: { [key in Instrument]: string } = {
  piano: 'piano_tone',
  guitar: 'guitar_tone',
  drums: 'drum_hit',
  synth: 'synth_beep',
  bell: 'bell_ring',
  none: '',
};

// Player-specific sound files (used when instrument is selected)
const playerSoundFiles: { [key in 'X' | 'O']: string } = {
  X: 'player_x',
  O: 'player_o',
};

let currentInstrument: Instrument = 'piano';

// Set the current instrument
export const setInstrument = (instrument: Instrument) => {
  currentInstrument = instrument;
  // Switching to instrument
};

// Get current instrument
export const getInstrument = (): Instrument => {
  return currentInstrument;
};

// Play sound (same sound for both players)
export const playMoveSound = () => {
  if (currentInstrument === 'none') {
    return;
  }

  playSound();
};

// Internal function to play the sound
const playSound = () => {
  try {
    if (Platform.OS === 'android' && SoundPlayerModule) {
      // Use native MediaPlayer to play WAV files
      const soundFile = soundFiles[currentInstrument];
      if (soundFile) {
        SoundPlayerModule.playSound(`${soundFile}.wav`)
          .then((success: boolean) => {
            if (success) {
              // Successfully played sound
            } else {
              // Failed to play sound
              // Fallback to vibration
              fallbackToVibration();
            }
          })
          .catch((error: any) => {
            // Error playing WAV file
            // Fallback to vibration
            fallbackToVibration();
          });
      } else {
        fallbackToVibration();
      }
    } else {
      // Fallback to vibration if native module not available
      fallbackToVibration();
    }
  } catch (error) {
    // Error playing sound
    fallbackToVibration();
  }
};

// Fallback to vibration if WAV playback fails
const fallbackToVibration = () => {
  try {
    const { Vibration } = require('react-native');
    const durations: { [key in Instrument]: number } = {
      piano: 50,
      guitar: 80,
      drums: 100,
      synth: 60,
      bell: 90,
      none: 0,
    };
    const duration = durations[currentInstrument] || 50;
    if (duration > 0) {
      Vibration.vibrate(duration);
      // Using vibration fallback
    }
  } catch (e) {
    // Vibration fallback also failed
  }
};

// Cleanup sounds
export const cleanupSounds = () => {
  // Stop any playing sounds via native module
  if (Platform.OS === 'android' && SoundPlayerModule) {
    try {
      SoundPlayerModule.stopSound().catch(() => {});
    } catch (e) {
      // Ignore cleanup errors
    }
  }
};

// Load saved instrument preference on startup
const loadSavedInstrument = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const saved = await AsyncStorage.getItem('@tictactoe_instrument');
    if (saved) {
      const instrument = JSON.parse(saved) as Instrument;
      setInstrument(instrument);
    } else {
      setInstrument('piano');
    }
  } catch (error) {
    // Default to piano if loading fails
    setInstrument('piano');
  }
};

// Initialize default instrument (will be overridden by saved preference)
loadSavedInstrument();
