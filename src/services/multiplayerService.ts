import { Platform } from 'react-native';
import { Board, Player } from '../types/game';

// Import TcpSocket with error handling
let TcpSocket: any = null;
let TcpSocketAvailable = false;

try {
  const tcpModule = require('react-native-tcp-socket');
  TcpSocket = tcpModule.default || tcpModule;
  
  if (!TcpSocket) {
    // TcpSocket module not available
  } else {
    if (!TcpSocket.createServer) {
      // TcpSocket.createServer not available
    } else {
      TcpSocketAvailable = true;
    }
  }
} catch (error) {
  // Failed to load TcpSocket
}

// Export availability check
export const isMultiplayerAvailable = () => TcpSocketAvailable;

export type MultiplayerRole = 'host' | 'client' | null;
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface MultiplayerState {
  role: MultiplayerRole;
  status: ConnectionStatus;
  serverSocket: any;
  clientSocket: any;
  serverPort: number;
  serverAddress: string;
  isMyTurn: boolean;
  myPlayer: Player;
  opponentPlayer: Player;
}

export interface GameMessage {
  type: 'move' | 'reset' | 'sync' | 'ping' | 'pong';
  data?: any;
  board?: Board;
  currentPlayer?: Player;
  winner?: Player | null;
  isDraw?: boolean;
}

class MultiplayerService {
  private state: MultiplayerState = {
    role: null,
    status: 'disconnected',
    serverSocket: null,
    clientSocket: null,
    serverPort: 8888,
    serverAddress: '',
    isMyTurn: false,
    myPlayer: 'X',
    opponentPlayer: 'O',
  };

  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  // Event listeners
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Get current state
  getState(): MultiplayerState {
    return { ...this.state };
  }

  // Get device IP address (simplified - in production, use a proper method)
  async getDeviceIP(): Promise<string> {
    // For Android emulators:
    // - 10.0.2.2 is the special IP that refers to the host machine's localhost
    // - For emulator-to-emulator communication, use 10.0.2.2 to connect to the host
    // - The server on the host emulator listens on 0.0.0.0, accessible via 10.0.2.2 from other emulators
    if (Platform.OS === 'android') {
      // Try to get IP from native module
      try {
        const { NativeModules } = require('react-native');
        const NetworkInfoModule = NativeModules.NetworkInfoModule;
        
        if (NetworkInfoModule && NetworkInfoModule.getDeviceIP) {
          const ip: string | null = await NetworkInfoModule.getDeviceIP();
          
          if (ip && ip !== 'null' && ip.trim() !== '') {
            return ip;
          }
        }
      } catch (nativeError) {
        // Native IP detection failed, using fallback
      }
      
      // Fallback for emulators in development
      if (__DEV__) {
        return '10.0.2.2'; // Android emulator's way to access host machine
      }
    }
    
    // For physical devices or if native module fails
    return 'Check WiFi Settings';
  }

  // Start hosting a game
  async startHosting(port: number = 8888): Promise<boolean> {
    try {
      // Disconnect any existing connections first (silently to avoid false alerts)
      this.disconnect(true);
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));

      this.state.role = 'host';
      this.state.status = 'connecting';
      this.state.serverPort = port;
      this.state.myPlayer = 'X';
      this.state.opponentPlayer = 'O';
      this.state.isMyTurn = true;

      // Check if TcpSocket is available
      if (!TcpSocket) {
        const errorMsg = 'TcpSocket module is not available. Please ensure react-native-tcp-socket is properly installed and linked. You may need to rebuild the app.';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      if (typeof TcpSocket.createServer !== 'function') {
        const errorMsg = 'TcpSocket.createServer is not a function. The module may not be properly linked. Please rebuild the app.';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Create server with connection handler
      let server: any = null;
      try {
        server = TcpSocket.createServer(
          (socket: any) => {
            // Client connected
            this.state.clientSocket = socket;
            this.state.status = 'connected';
            this.emit('connected', { role: 'host' });

            socket.on('data', (data: any) => {
              try {
                const message: GameMessage = JSON.parse(data.toString());
                this.handleMessage(message);
              } catch (error) {
                // Error parsing message
              }
            });

            socket.on('error', (error: any) => {
              // Socket error
              this.emit('error', error);
            });

            socket.on('close', () => {
              // Client disconnected
              this.state.status = 'disconnected';
              this.emit('disconnected', {});
              this.disconnect();
            });
          }
        );
      } catch (createError: any) {
        const errorMsg = `Failed to create server: ${createError.message}. The react-native-tcp-socket module may not be properly linked. Please rebuild the app.`;
        console.error(errorMsg, createError);
        throw new Error(errorMsg);
      }

      // Check if server was created successfully
      if (!server || server === null) {
        const errorMsg = 'Failed to create server - createServer returned null. The react-native-tcp-socket native module is not properly linked. Please rebuild the app: cd android && ./gradlew clean && cd .. && npx react-native run-android';
        console.error(errorMsg);
        console.error('TcpSocket object:', TcpSocket);
        console.error('TcpSocket methods:', TcpSocket ? Object.keys(TcpSocket) : 'TcpSocket is null');
        throw new Error(errorMsg);
      }

      // Check if listen method exists
      if (typeof server.listen !== 'function') {
        console.error('Server object:', server);
        console.error('Server type:', typeof server);
        console.error('Server methods:', server ? Object.keys(server) : 'server is null');
        const errorMsg = `Server object does not have listen method. The native module may not be properly linked. Please rebuild the app. Available methods: ${server ? Object.keys(server).join(', ') : 'none'}`;
        throw new Error(errorMsg);
      }

      // Store server reference before calling listen
      this.state.serverSocket = server;
      
      // Start listening on the port
      // For Android, try binding without address first (defaults to all interfaces)
      // This often works better than explicitly specifying 0.0.0.0
      // If that fails, the error handler will catch it
      if (Platform.OS === 'android') {
        // On Android, try without address (binds to all interfaces by default)
        server.listen(port, () => {
          // Server listening on port (all interfaces)
          this.state.status = 'connecting';
          this.emit('hosting', { port });
        });
      } else {
        // On other platforms, explicitly bind to 0.0.0.0
        server.listen(port, '0.0.0.0', () => {
          // Server listening on port at 0.0.0.0
          this.state.status = 'connecting';
          this.emit('hosting', { port });
        });
      }

      // Handle server errors
      server.on('error', (error: any) => {
        // Server error
        const errorMessage = error.message || error.toString();
        
        // Handle port already in use error
        if (errorMessage.includes('EADDRINUSE') || errorMessage.includes('Address already in use')) {
          const errorMsg = `Port ${port} is already in use. Please wait a moment and try again, or use a different port.`;
          this.state.status = 'error';
          this.emit('error', new Error(errorMsg));
          // Clean up
          this.disconnect(true);
        } else if (errorMessage.includes('EACCES') || errorMessage.includes('Permission denied')) {
          // Handle permission denied error - try a different port or provide helpful message
          const errorMsg = `Permission denied to bind to port ${port}. Try using a port above 1024 (e.g., 8888, 9999) or restart the app.`;
          this.state.status = 'error';
          this.emit('error', new Error(errorMsg));
          // Clean up
          this.disconnect(true);
        } else {
          this.state.status = 'error';
          this.emit('error', error);
        }
      });

      return true;
    } catch (error: any) {
      // Error starting server
      this.state.status = 'error';
      this.emit('error', error);
      return false;
    }
  }

  // Join a game
  async joinGame(address: string, port: number = 8888): Promise<boolean> {
    try {
      this.state.role = 'client';
      this.state.status = 'connecting';
      this.state.serverAddress = address;
      this.state.serverPort = port;
      this.state.myPlayer = 'O';
      this.state.opponentPlayer = 'X';
      this.state.isMyTurn = false;

      // Check if TcpSocket is available
      if (!TcpSocket) {
        const errorMsg = 'TcpSocket module is not available. Please ensure react-native-tcp-socket is properly installed and linked. You may need to rebuild the app.';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      if (typeof TcpSocket.createConnection !== 'function') {
        const errorMsg = 'TcpSocket.createConnection is not a function. The module may not be properly linked. Please rebuild the app.';
        throw new Error(errorMsg);
      }

      let client: any = null;
      try {
        client = TcpSocket.createConnection(
          { port, host: address },
          () => {
            // Connected to server
            this.state.clientSocket = client;
            this.state.status = 'connected';
            this.emit('connected', { role: 'client' });
          }
        );
      } catch (createError: any) {
        const errorMsg = `Failed to create client connection: ${createError.message}. The react-native-tcp-socket module may not be properly linked. Please rebuild the app.`;
        throw new Error(errorMsg);
      }

      if (!client || client === null) {
        const errorMsg = 'Failed to create client connection - createConnection returned null. The react-native-tcp-socket native module is not properly linked. Please rebuild the app.';
        throw new Error(errorMsg);
      }

      client.on('data', (data: any) => {
        try {
          const message: GameMessage = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          // Error parsing message
        }
      });

      client.on('error', (error: any) => {
        // Connection error
        this.state.status = 'error';
        this.emit('error', error);
      });

      client.on('close', () => {
        // Disconnected from server
        this.state.status = 'disconnected';
        this.emit('disconnected', {});
        this.disconnect();
      });

      return true;
    } catch (error) {
      // Error joining game
      this.state.status = 'error';
      this.emit('error', error);
      return false;
    }
  }

  // Send a message
  private sendMessage(message: GameMessage) {
    const socket = this.state.role === 'host' 
      ? this.state.clientSocket 
      : this.state.clientSocket;

    if (socket && this.state.status === 'connected') {
      try {
        const data = JSON.stringify(message);
        socket.write(data);
      } catch (error) {
        // Error sending message
      }
    }
  }

  // Handle incoming messages
  private handleMessage(message: GameMessage) {
    switch (message.type) {
      case 'move':
        this.emit('move', message.data);
        break;
      case 'reset':
        this.emit('reset', {});
        break;
      case 'sync':
        this.emit('sync', {
          board: message.board,
          currentPlayer: message.currentPlayer,
          winner: message.winner,
          isDraw: message.isDraw,
        });
        break;
      case 'ping':
        this.sendMessage({ type: 'pong' });
        break;
      default:
        break;
    }
  }

  // Send move to opponent
  sendMove(index: number) {
    if (this.state.isMyTurn && this.state.status === 'connected') {
      this.sendMessage({
        type: 'move',
        data: { index, player: this.state.myPlayer },
      });
      this.state.isMyTurn = false;
    }
  }

  // Send reset game
  sendReset() {
    if (this.state.status === 'connected') {
      this.sendMessage({ type: 'reset' });
    }
  }

  // Send game state sync
  sendSync(board: Board, currentPlayer: Player, winner: Player | null, isDraw: boolean) {
    if (this.state.status === 'connected') {
      this.sendMessage({
        type: 'sync',
        board,
        currentPlayer,
        winner,
        isDraw,
      });
    }
  }

  // Set turn
  setMyTurn(isMyTurn: boolean) {
    this.state.isMyTurn = isMyTurn;
  }

  // Disconnect
  disconnect(silent: boolean = false) {
    const wasConnected = this.state.status === 'connected';
    
    if (this.state.serverSocket) {
      try {
        // Remove all listeners before closing
        if (this.state.serverSocket.removeAllListeners) {
          this.state.serverSocket.removeAllListeners('error');
          this.state.serverSocket.removeAllListeners('connection');
        }
        // Close the server
        if (this.state.serverSocket.close) {
          this.state.serverSocket.close();
        }
        // Destroy if available
        if (this.state.serverSocket.destroy) {
          this.state.serverSocket.destroy();
        }
      } catch (error) {
        // Error closing server
      }
      this.state.serverSocket = null;
    }

    if (this.state.clientSocket) {
      try {
        // Remove all listeners before destroying
        if (this.state.clientSocket.removeAllListeners) {
          this.state.clientSocket.removeAllListeners('data');
          this.state.clientSocket.removeAllListeners('error');
          this.state.clientSocket.removeAllListeners('close');
        }
        // Destroy the client socket
        if (this.state.clientSocket.destroy) {
          this.state.clientSocket.destroy();
        }
      } catch (error) {
        // Error closing client
      }
      this.state.clientSocket = null;
    }

    this.state.role = null;
    this.state.status = 'disconnected';
    this.state.isMyTurn = false;
    
    // Only emit disconnected event if we were actually connected and not doing a silent disconnect
    if (wasConnected && !silent) {
      this.emit('disconnected', {});
    }
  }

  // Check if it's my turn
  isMyTurn(): boolean {
    return this.state.isMyTurn;
  }

  // Get my player
  getMyPlayer(): Player {
    return this.state.myPlayer;
  }

  // Get opponent player
  getOpponentPlayer(): Player {
    return this.state.opponentPlayer;
  }
}

export const multiplayerService = new MultiplayerService();

