import React, { useState, useEffect, useRef } from 'react';
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
import { useGameStore } from '../store/gameStore';
import { multiplayerService, ConnectionStatus, isMultiplayerAvailable } from '../services/multiplayerService';
import { internetMultiplayerService, isInternetMultiplayerAvailable, getFirebaseError, InternetConnectionStatus } from '../services/internetMultiplayerService';
import { Toast } from './Toast';
import { ConfirmModal } from './ConfirmModal';

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
  const { boardSize, setBoardSize } = useGameStore();
  const [connectionType, setConnectionType] = useState<'wifi' | 'internet'>('internet');
  const [mode, setMode] = useState<'host' | 'join' | null>(null);
  const [serverAddress, setServerAddress] = useState('');
  const [serverPort, setServerPort] = useState('8888');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | InternetConnectionStatus>('disconnected');
  const [deviceIP, setDeviceIP] = useState('Loading...');
  const [ipCopied, setIpCopied] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<'host' | 'client' | null>(null);

  useEffect(() => {
    if (visible) {
      // Check current connection status
      checkCurrentConnection();
      
      // Get device IP for WiFi mode
      if (connectionType === 'wifi') {
        loadDeviceIP();
      }

      // Setup event listeners based on connection type
      if (connectionType === 'wifi') {
        setupWiFiListeners();
      } else {
        setupInternetListeners();
      }

      return () => {
        // Cleanup listeners
        if (connectionType === 'wifi') {
          cleanupWiFiListeners();
        } else {
          cleanupInternetListeners();
        }
      };
    }
  }, [visible, connectionType, onConnected]);

  const checkCurrentConnection = () => {
    if (connectionType === 'wifi') {
      const wifiState = multiplayerService.getState();
      if (wifiState.status === 'connected') {
        setConnectionStatus('connected');
        setCurrentRole(wifiState.role);
        setMode(wifiState.role === 'client' ? 'join' : wifiState.role || null);
        if (wifiState.role === 'host') {
          setDeviceIP(wifiState.serverAddress || '');
        }
      } else {
        setMode(null);
        setConnectionStatus('disconnected');
        setCurrentRole(null);
      }
    } else {
      const internetState = internetMultiplayerService.getState();
      if (internetState.status === 'connected') {
        setConnectionStatus('connected');
        setCurrentRole(internetState.isHost ? 'host' : 'client');
        setCurrentRoomId(internetState.roomId);
        setRoomCode(internetState.roomId || '');
        setMode(internetState.isHost ? 'host' : 'join');
      } else {
        setMode(null);
        setConnectionStatus('disconnected');
        setCurrentRole(null);
        setCurrentRoomId(null);
        setRoomCode('');
      }
    }
  };

  const setupWiFiListeners = () => {
    const handleConnected = () => {
      setConnectionStatus('connected');
      setToastMessage('Connected! You are now connected to your opponent.');
      setToastVisible(true);
      // Auto-close modal after showing toast
      setTimeout(() => {
        onConnected();
      }, 500);
    };

    const handleHosting = () => {
      setConnectionStatus('connecting');
    };

    const handleDisconnected = () => {
      if (connectionStatus === 'connected') {
        setConnectionStatus('disconnected');
        Alert.alert('Disconnected', 'Connection lost.');
      } else {
        setConnectionStatus('disconnected');
      }
    };

    const handleError = (error: any) => {
      setConnectionStatus('error');
      let errorMessage = error.message || 'Failed to connect.';
      Alert.alert('Connection Error', errorMessage);
    };

    multiplayerService.on('connected', handleConnected);
    multiplayerService.on('hosting', handleHosting);
    multiplayerService.on('disconnected', handleDisconnected);
    multiplayerService.on('error', handleError);
  };

  const cleanupWiFiListeners = () => {
    multiplayerService.off('connected', () => {});
    multiplayerService.off('hosting', () => {});
    multiplayerService.off('disconnected', () => {});
    multiplayerService.off('error', () => {});
  };

  // Store handler references to properly clean them up
  const handlerRefs = React.useRef<{
    handleConnected?: () => void;
    handleDisconnected?: () => void;
    handleError?: (error: any) => void;
    handleSync?: (data: any) => void;
  }>({});

  const setupInternetListeners = () => {
    // Prevent multiple alerts with a flag
    let hasShownConnectedAlert = false;

    const handleConnected = () => {
      if (hasShownConnectedAlert) return;
      hasShownConnectedAlert = true;
      setConnectionStatus('connected');
      setToastMessage('Connected! You are now connected to your opponent.');
      setToastVisible(true);
      // Auto-close modal after showing toast
      setTimeout(() => {
        onConnected();
      }, 500);
    };

    const handleDisconnected = () => {
      hasShownConnectedAlert = false; // Reset flag on disconnect
      if (connectionStatus === 'connected') {
        setConnectionStatus('disconnected');
        Alert.alert('Disconnected', 'Connection lost.');
      } else {
        setConnectionStatus('disconnected');
      }
    };

    const handleError = (error: any) => {
      setConnectionStatus('error');
      let errorMessage = error.message || 'Failed to connect.';
      if (errorMessage.includes('Firebase')) {
        errorMessage = 'Firebase is not configured. Please set up Firebase to use internet multiplayer.\n\nSee FIREBASE_SETUP.md for instructions.';
      }
      Alert.alert('Connection Error', errorMessage);
    };

    const handleSync = (data: any) => {
      // Game state sync handled by gameStore
    };

    // Store references for cleanup
    handlerRefs.current.handleConnected = handleConnected;
    handlerRefs.current.handleDisconnected = handleDisconnected;
    handlerRefs.current.handleError = handleError;
    handlerRefs.current.handleSync = handleSync;

    internetMultiplayerService.on('connected', handleConnected);
    internetMultiplayerService.on('disconnected', handleDisconnected);
    internetMultiplayerService.on('error', handleError);
    internetMultiplayerService.on('sync', handleSync);
  };

  const cleanupInternetListeners = () => {
    if (handlerRefs.current.handleConnected) {
      internetMultiplayerService.off('connected', handlerRefs.current.handleConnected);
    }
    if (handlerRefs.current.handleDisconnected) {
      internetMultiplayerService.off('disconnected', handlerRefs.current.handleDisconnected);
    }
    if (handlerRefs.current.handleError) {
      internetMultiplayerService.off('error', handlerRefs.current.handleError);
    }
    if (handlerRefs.current.handleSync) {
      internetMultiplayerService.off('sync', handlerRefs.current.handleSync);
    }
    handlerRefs.current = {};
  };

  const loadDeviceIP = async () => {
    try {
      const ip = await multiplayerService.getDeviceIP();
      setDeviceIP(ip);
    } catch (error) {
      setDeviceIP('Check WiFi Settings');
    }
  };

  const copyIPToClipboard = async () => {
    if (deviceIP && deviceIP !== 'Loading...' && deviceIP !== 'Check WiFi Settings') {
      await Clipboard.setString(deviceIP);
      setIpCopied(true);
      setToastMessage(`IP address ${deviceIP} copied to clipboard`);
      setToastVisible(true);
      setTimeout(() => setIpCopied(false), 2000);
    }
  };

  const copyRoomCodeToClipboard = async () => {
    if (roomCode) {
      await Clipboard.setString(roomCode);
      setRoomCodeCopied(true);
      setToastMessage(`Room code ${roomCode} copied to clipboard`);
      setToastVisible(true);
      setTimeout(() => setRoomCodeCopied(false), 2000);
    }
  };

  const openWiFiSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('app-settings:');
    }
  };

  const handleHostGame = async () => {
    if (connectionType === 'wifi') {
      setMode('host');
      setConnectionStatus('connecting');
      const port = parseInt(serverPort) || 8888;
      const success = await multiplayerService.startHosting(port);
      if (!success) {
        setConnectionStatus('error');
      }
    } else {
      // Internet mode - automatically set to 3x3
      if (boardSize !== 3) {
        setBoardSize(3);
      }
      setMode('host');
      setConnectionStatus('connecting');
      try {
        if (!isInternetMultiplayerAvailable()) {
          const errorMsg = getFirebaseError();
          Alert.alert(
            'Internet Multiplayer Not Available',
            `Firebase is not configured. ${errorMsg ? `\n\nError: ${errorMsg}` : ''}\n\nPlease ensure:\n1. google-services.json is in android/app/\n2. App has been rebuilt after adding Firebase\n3. Realtime Database is enabled in Firebase Console\n\nSee FIREBASE_SETUP.md for instructions.`
          );
          setConnectionStatus('error');
          return;
        }
        const roomId = await internetMultiplayerService.createRoom();
        setRoomCode(roomId);
        setConnectionStatus('connecting');
      } catch (error: any) {
        setConnectionStatus('error');
        Alert.alert('Error', error.message || 'Failed to create room.');
      }
    }
  };

  const handleJoinGame = async () => {
    if (connectionType === 'wifi') {
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
    } else {
      // Internet mode - automatically set to 3x3
      if (boardSize !== 3) {
        setBoardSize(3);
      }
      if (!serverAddress.trim()) {
        Alert.alert('Error', 'Please enter room code');
        return;
      }
      setMode('join');
      setConnectionStatus('connecting');
      const success = await internetMultiplayerService.joinRoom(serverAddress.trim().toUpperCase());
      if (!success) {
        setConnectionStatus('error');
      }
    }
  };

  const handleDisconnect = () => {
    setShowDisconnectConfirm(true);
  };

  const confirmDisconnect = () => {
    setShowDisconnectConfirm(false);
    if (connectionType === 'wifi') {
      multiplayerService.disconnect();
    } else {
      internetMultiplayerService.disconnect();
    }
    setMode(null);
    setConnectionStatus('disconnected');
    setServerAddress('');
    setRoomCode('');
    setCurrentRoomId(null);
    setCurrentRole(null);
    // Reset to allow creating/joining new rooms
    setTimeout(() => {
      checkCurrentConnection();
    }, 100);
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
    connectionTypeContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 12,
    },
    connectionTypeButton: {
      flex: 1,
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      padding: 14,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
      alignItems: 'center',
    },
    connectionTypeButtonActive: {
      borderColor: theme.colors.buttonPrimary,
      borderWidth: 3,
      backgroundColor: theme.colors.boardBackground,
    },
    connectionTypeText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    connectionTypeTextActive: {
      color: theme.colors.buttonPrimary,
      fontWeight: 'bold',
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
    ipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      gap: 8,
    },
    ipAddress: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.buttonPrimary,
      textAlign: 'center',
      flex: 1,
    },
    roomCode: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.buttonPrimary,
      textAlign: 'center',
      letterSpacing: 4,
      marginVertical: 8,
    },
    copyButton: {
      backgroundColor: theme.colors.buttonPrimary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginLeft: 8,
    },
    copyButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    wifiButton: {
      backgroundColor: theme.colors.buttonSecondary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 12,
      alignItems: 'center',
    },
    wifiButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    ipHelpText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 18,
      fontStyle: 'italic',
    },
    closeButton: {
      marginBottom: 40,
      backgroundColor: theme.colors.buttonSecondary,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 20,
      alignItems: 'center',
    },
    connectionDetailsContainer: {
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.buttonPrimary,
    },
    connectionDetailsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    connectionDetailsSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    connectionDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    connectionDetailLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    connectionDetailValue: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      fontWeight: 'bold',
    },
    roomIdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    roomIdValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.buttonPrimary,
      letterSpacing: 2,
    },
    copyButtonSmall: {
      backgroundColor: theme.colors.buttonPrimary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    copyButtonTextSmall: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
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
            Play with a friend over WiFi or internet
          </Text>

          {/* Connection Type Selection */}
          <View style={styles.connectionTypeContainer}>
            <TouchableOpacity
              style={[
                styles.connectionTypeButton,
                connectionType === 'wifi' && styles.connectionTypeButtonActive,
              ]}
              onPress={() => {
                setConnectionType('wifi');
                setMode(null);
                setConnectionStatus('disconnected');
                setRoomCode('');
                internetMultiplayerService.disconnect();
                loadDeviceIP();
              }}>
              <Text style={[
                styles.connectionTypeText,
                connectionType === 'wifi' && styles.connectionTypeTextActive,
              ]}>
                📶 WiFi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.connectionTypeButton,
                connectionType === 'internet' && styles.connectionTypeButtonActive,
              ]}
              onPress={() => {
                setConnectionType('internet');
                setMode(null);
                setConnectionStatus('disconnected');
                setServerAddress('');
                multiplayerService.disconnect();
                // Automatically set board size to 3x3 for internet multiplayer
                if (boardSize !== 3) {
                  setBoardSize(3);
                }
              }}>
              <Text style={[
                styles.connectionTypeText,
                connectionType === 'internet' && styles.connectionTypeTextActive,
              ]}>
                🌍 Internet
              </Text>
            </TouchableOpacity>
          </View>

          {/* WiFi Mode Content */}
          {connectionType === 'wifi' && connectionStatus !== 'connected' && (
            <>
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
                  Both devices must be on the same WiFi network.
                </Text>
                {mode === 'host' && (
                  <>
                    <View style={styles.ipDisplay}>
                      <Text style={styles.ipText}>Your IP Address:</Text>
                      <View style={styles.ipRow}>
                        <Text style={styles.ipAddress}>{deviceIP}</Text>
                        <TouchableOpacity
                          style={styles.copyButton}
                          onPress={copyIPToClipboard}
                        >
                          <Text style={styles.copyButtonText}>
                            {ipCopied ? '✓ Copied' : '📋 Copy'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {deviceIP === 'Check WiFi Settings' && (
                        <TouchableOpacity
                          style={styles.wifiButton}
                          onPress={openWiFiSettings}
                        >
                          <Text style={styles.wifiButtonText}>Open WiFi Settings</Text>
                        </TouchableOpacity>
                      )}
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
                    {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
                      <TouchableOpacity style={styles.button} onPress={handleHostGame}>
                        <Text style={styles.buttonText}>Start Hosting</Text>
                      </TouchableOpacity>
                    )}
                    {connectionStatus === 'connecting' && (
                      <View style={[styles.button, { backgroundColor: theme.colors.buttonSecondary }]}>
                        <Text style={styles.buttonText}>Waiting for player to join...</Text>
                      </View>
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
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Internet Mode Content */}
          {connectionType === 'internet' && connectionStatus !== 'connected' && (
            <>
              {/* Host Game Option */}
              <TouchableOpacity
                style={[
                  styles.modeOption,
                  mode === 'host' && styles.modeOptionSelected,
                ]}
                onPress={() => setMode('host')}>
                <Text style={styles.modeTitle}>🌍 Create Room</Text>
                <Text style={styles.modeDescription}>
                  Create a game room and share the room code with your friend. Works from anywhere in the world!
                </Text>
                {mode === 'host' && (
                  <>
                    {roomCode ? (
                      <View style={styles.ipDisplay}>
                        <Text style={styles.ipText}>Room Code:</Text>
                        <Text style={styles.roomCode}>{roomCode}</Text>
                        <TouchableOpacity
                          style={styles.copyButton}
                          onPress={copyRoomCodeToClipboard}
                        >
                          <Text style={styles.copyButtonText}>
                            {roomCodeCopied ? '✓ Copied' : '📋 Copy Room Code'}
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.ipHelpText}>
                          Share this room code with your friend. They can join from anywhere in the world!
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.button} onPress={handleHostGame}>
                        <Text style={styles.buttonText}>Create Room</Text>
                      </TouchableOpacity>
                    )}
                    {connectionStatus === 'connecting' && !roomCode && (
                      <Text style={styles.statusText}>Creating room...</Text>
                    )}
                    {connectionStatus === 'connecting' && roomCode && (
                      <Text style={styles.statusText}>Waiting for player to join...</Text>
                    )}
                    {connectionStatus === 'error' && (
                      <TouchableOpacity style={styles.button} onPress={handleHostGame}>
                        <Text style={styles.buttonText}>Try Again</Text>
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
                <Text style={styles.modeTitle}>🔗 Join Room</Text>
                <Text style={styles.modeDescription}>
                  Enter the room code your friend shared with you.
                </Text>
                {mode === 'join' && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Room Code</Text>
                      <TextInput
                        style={styles.input}
                        value={serverAddress}
                        onChangeText={(text) => setServerAddress(text.toUpperCase())}
                        placeholder="ABC123"
                        placeholderTextColor={theme.colors.textSecondary}
                        autoCapitalize="characters"
                        maxLength={6}
                      />
                    </View>
                    {connectionStatus === 'disconnected' && (
                      <TouchableOpacity style={styles.button} onPress={handleJoinGame}>
                        <Text style={styles.buttonText}>Join Room</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Connection Details - Show if already connected */}
          {connectionStatus === 'connected' && (
            <View style={styles.connectionDetailsContainer}>
              <Text style={styles.connectionDetailsTitle}>🔗 Connection Details</Text>
              <View style={styles.connectionDetailRow}>
                <Text style={styles.connectionDetailLabel}>Type:</Text>
                <Text style={styles.connectionDetailValue}>
                  {connectionType === 'wifi' ? '📶 WiFi' : '🌍 Internet'}
                </Text>
              </View>
              <View style={styles.connectionDetailRow}>
                <Text style={styles.connectionDetailLabel}>Role:</Text>
                <Text style={styles.connectionDetailValue}>
                  {currentRole === 'host' ? '👑 Host' : '👤 Player'}
                </Text>
              </View>
              {connectionType === 'internet' && currentRoomId && (
                <View style={styles.connectionDetailRow}>
                  <Text style={styles.connectionDetailLabel}>Room ID:</Text>
                  <View style={styles.roomIdContainer}>
                    <Text style={styles.roomIdValue}>{currentRoomId}</Text>
                    <TouchableOpacity
                      style={styles.copyButtonSmall}
                      onPress={copyRoomCodeToClipboard}
                    >
                      <Text style={styles.copyButtonTextSmall}>
                        {roomCodeCopied ? '✓' : '📋'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {connectionType === 'wifi' && currentRole === 'host' && deviceIP && (
                <View style={styles.connectionDetailRow}>
                  <Text style={styles.connectionDetailLabel}>IP Address:</Text>
                  <View style={styles.roomIdContainer}>
                    <Text style={styles.roomIdValue}>{deviceIP}</Text>
                    <TouchableOpacity
                      style={styles.copyButtonSmall}
                      onPress={copyIPToClipboard}
                    >
                      <Text style={styles.copyButtonTextSmall}>
                        {ipCopied ? '✓' : '📋'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={[styles.button, styles.buttonDestructive, { marginTop: 16 }]}
                onPress={handleDisconnect}>
                <Text style={styles.buttonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Status */}
          {(connectionStatus === 'connecting' || connectionStatus === 'error') && (
            <Text
              style={[
                styles.statusText,
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
      
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        duration={3000}
        onHide={() => setToastVisible(false)}
      />

      {/* Disconnect Confirmation Modal */}
      <ConfirmModal
        visible={showDisconnectConfirm}
        title="Disconnect?"
        message={`Are you sure you want to disconnect from the ${connectionType === 'wifi' ? 'WiFi' : 'Internet'} game?`}
        confirmText="Disconnect"
        cancelText="Cancel"
        confirmButtonStyle="destructive"
        onConfirm={confirmDisconnect}
        onCancel={() => setShowDisconnectConfirm(false)}
      />
    </Modal>
  );
};
