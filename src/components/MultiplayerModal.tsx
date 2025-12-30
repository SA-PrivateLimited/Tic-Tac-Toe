import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  Clipboard,
  Linking,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { multiplayerService, ConnectionStatus, isMultiplayerAvailable } from '../services/multiplayerService';

interface MultiplayerModalProps {
  visible: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  visible,
  onClose,
  onConnected,
}) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'host' | 'join' | null>(null);
  const [serverAddress, setServerAddress] = useState('');
  const [serverPort, setServerPort] = useState('8888');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [deviceIP, setDeviceIP] = useState('10.0.2.2'); // Default to emulator host IP

  useEffect(() => {
    if (visible) {
      // Check if multiplayer is available
      if (!isMultiplayerAvailable()) {
        Alert.alert(
          'Multiplayer Not Available',
          'The network module is not properly linked. Please rebuild the app:\n\n1. Stop Metro bundler\n2. cd android && ./gradlew clean\n3. cd .. && npm run android\n\nMultiplayer features will not work until the app is rebuilt.',
          [{ text: 'OK' }]
        );
      }
      
      // Get device IP (simplified - in production use proper method)
      multiplayerService.getDeviceIP().then(ip => {
        setDeviceIP(ip);
      });

      // Listen for connection events
      const handleConnected = () => {
        setConnectionStatus('connected');
        Alert.alert('Connected!', 'You are now connected to your opponent.', [
          { text: 'OK', onPress: onConnected },
        ]);
      };

      const handleDisconnected = () => {
        setConnectionStatus('disconnected');
        Alert.alert('Disconnected', 'Connection lost.');
      };

      const handleError = (error: any) => {
        setConnectionStatus('error');
        let errorMessage = error.message || 'Failed to connect.';
        
        // Provide helpful error messages
        if (errorMessage.includes('createServer') || errorMessage.includes('null') || errorMessage.includes('not properly linked')) {
          errorMessage = 'Network module not available. The multiplayer feature requires the app to be rebuilt.\n\nPlease rebuild the app:\n1. Stop Metro bundler\n2. cd android && ./gradlew clean\n3. cd .. && npm run android\n\nOr use the development build.';
        }
        
        Alert.alert('Connection Error', errorMessage);
      };

      multiplayerService.on('connected', handleConnected);
      multiplayerService.on('disconnected', handleDisconnected);
      multiplayerService.on('error', handleError);

      return () => {
        multiplayerService.off('connected', handleConnected);
        multiplayerService.off('disconnected', handleDisconnected);
        multiplayerService.off('error', handleError);
      };
    }
  }, [visible, onConnected]);

  const handleHostGame = async () => {
    setMode('host');
    setConnectionStatus('connecting');
    const port = parseInt(serverPort) || 8888;
    const success = await multiplayerService.startHosting(port);
    if (!success) {
      setConnectionStatus('error');
    }
  };

  const handleJoinGame = async () => {
    if (!serverAddress.trim()) {
      Alert.alert('Error', 'Please enter server IP address');
      return;
    }
    setMode('join');
    setConnectionStatus('connecting');
    const port = parseInt(serverPort) || 8888;
    const success = await multiplayerService.joinGame(serverAddress.trim(), port);
    if (!success) {
      setConnectionStatus('error');
    }
  };

  const handleDisconnect = () => {
    multiplayerService.disconnect();
    setMode(null);
    setConnectionStatus('disconnected');
    setServerAddress('');
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
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    modeOption: {
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
    },
    modeOptionSelected: {
      borderColor: theme.colors.buttonPrimary,
      borderWidth: 3,
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
      marginBottom: 12,
    },
    inputContainer: {
      marginTop: 12,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.boardBackground,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: theme.colors.textPrimary,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
    },
    button: {
      backgroundColor: theme.colors.buttonPrimary,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 12,
      alignItems: 'center',
    },
    buttonSecondary: {
      backgroundColor: theme.colors.buttonSecondary,
    },
    buttonDestructive: {
      backgroundColor: theme.colors.buttonDestructive,
    },
    buttonText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    statusText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
      fontStyle: 'italic',
    },
    statusConnected: {
      color: '#4ecca3',
    },
    statusError: {
      color: theme.colors.buttonDestructive,
    },
    ipDisplay: {
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 10,
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.colors.cellBorder,
    },
    ipText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    ipAddress: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.buttonPrimary,
      textAlign: 'center',
      marginTop: 4,
    },
    closeButton: {
      marginBottom: 40,
      backgroundColor: theme.colors.buttonSecondary,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 20,
      alignItems: 'center',
    },
  });

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected!';
      case 'error':
        return 'Connection failed. Please try again.';
      default:
        return '';
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.modalContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>🌐 Multiplayer</Text>
          <Text style={styles.subtitle}>
            Play with a friend over WiFi on the same network
          </Text>

          {/* Host Game Option */}
          <TouchableOpacity
            style={[
              styles.modeOption,
              mode === 'host' && styles.modeOptionSelected,
            ]}
            onPress={() => setMode('host')}>
            <Text style={styles.modeTitle}>📡 Host Game</Text>
            <Text style={styles.modeDescription}>
              Start a game and wait for a friend to join. Share your IP address with them.
            </Text>
            {mode === 'host' && (
              <>
                <View style={styles.ipDisplay}>
                  <Text style={styles.ipText}>Your IP Address:</Text>
                  <Text style={styles.ipAddress}>{deviceIP}</Text>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Port (default: 8888)</Text>
                  <TextInput
                    style={styles.input}
                    value={serverPort}
                    onChangeText={setServerPort}
                    placeholder="8888"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                {connectionStatus === 'disconnected' && (
                  <TouchableOpacity style={styles.button} onPress={handleHostGame}>
                    <Text style={styles.buttonText}>Start Hosting</Text>
                  </TouchableOpacity>
                )}
                {connectionStatus === 'connected' && (
                  <TouchableOpacity
                    style={[styles.button, styles.buttonDestructive]}
                    onPress={handleDisconnect}>
                    <Text style={styles.buttonText}>Disconnect</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </TouchableOpacity>

          {/* Join Game Option */}
          <TouchableOpacity
            style={[
              styles.modeOption,
              mode === 'join' && styles.modeOptionSelected,
            ]}
            onPress={() => setMode('join')}>
            <Text style={styles.modeTitle}>🔗 Join Game</Text>
            <Text style={styles.modeDescription}>
              Enter the host's IP address to join their game.
            </Text>
            {mode === 'join' && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Host IP Address</Text>
                  <TextInput
                    style={styles.input}
                    value={serverAddress}
                    onChangeText={setServerAddress}
                    placeholder="192.168.1.100"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Port (default: 8888)</Text>
                  <TextInput
                    style={styles.input}
                    value={serverPort}
                    onChangeText={setServerPort}
                    placeholder="8888"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                {connectionStatus === 'disconnected' && (
                  <TouchableOpacity style={styles.button} onPress={handleJoinGame}>
                    <Text style={styles.buttonText}>Join Game</Text>
                  </TouchableOpacity>
                )}
                {connectionStatus === 'connected' && (
                  <TouchableOpacity
                    style={[styles.button, styles.buttonDestructive]}
                    onPress={handleDisconnect}>
                    <Text style={styles.buttonText}>Disconnect</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </TouchableOpacity>

          {/* Status */}
          {connectionStatus !== 'disconnected' && (
            <Text
              style={[
                styles.statusText,
                connectionStatus === 'connected' && styles.statusConnected,
                connectionStatus === 'error' && styles.statusError,
              ]}>
              {getStatusText()}
            </Text>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

