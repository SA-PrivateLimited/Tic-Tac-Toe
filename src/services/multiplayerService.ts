import { Platform } from 'react-native';
import { Board, Player } from '../types/game';

// Import TcpSocket with error handling
let TcpSocket: any = null;
try {
  const tcpModule = require('react-native-tcp-socket');
  TcpSocket = tcpModule.default || tcpModule;
  
  if (!TcpSocket) {
    console.error('TcpSocket module is null or undefined');
  } else {
    console.log('TcpSocket loaded. Available methods:', Object.keys(TcpSocket));
    if (!TcpSocket.createServer) {
      console.error('TcpSocket.createServer is not available');
    }
  }
} catch (error) {
  console.error('Failed to load TcpSocket:', error);
}

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
    // For Android, we'll use a placeholder
    // In production, use react-native-network-info or similar
    return '192.168.1.100'; // This should be replaced with actual IP detection
  }

  // Start hosting a game
  async startHosting(port: number = 8888): Promise<boolean> {
    try {
      this.state.role = 'host';
      this.state.status = 'connecting';
      this.state.serverPort = port;
      this.state.myPlayer = 'X';
      this.state.opponentPlayer = 'O';
      this.state.isMyTurn = true;

      // Check if TcpSocket is available
      if (!TcpSocket) {
        throw new Error('TcpSocket module is not available. Please ensure react-native-tcp-socket is properly installed and linked.');
      }

      if (typeof TcpSocket.createServer !== 'function') {
        throw new Error('TcpSocket.createServer is not a function. The module may not be properly linked.');
      }

      // Create server with connection handler
      const server = TcpSocket.createServer(
        (socket: any) => {
          console.log('Client connected');
          this.state.clientSocket = socket;
          this.state.status = 'connected';
          this.emit('connected', { role: 'host' });

          socket.on('data', (data: any) => {
            try {
              const message: GameMessage = JSON.parse(data.toString());
              this.handleMessage(message);
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });

          socket.on('error', (error: any) => {
            console.error('Socket error:', error);
            this.emit('error', error);
          });

          socket.on('close', () => {
            console.log('Client disconnected');
            this.state.status = 'disconnected';
            this.emit('disconnected', {});
            this.disconnect();
          });
        }
      );

      // Check if server was created successfully
      if (!server) {
        throw new Error('Failed to create server - createServer returned null or undefined');
      }

      // Check if listen method exists
      if (typeof server.listen !== 'function') {
        console.error('Server object:', server);
        console.error('Server methods:', Object.keys(server));
        throw new Error('Server object does not have listen method. Available methods: ' + Object.keys(server).join(', '));
      }

      // Store server reference before calling listen
      this.state.serverSocket = server;
      
      // Start listening on the port
      server.listen(port, '0.0.0.0', () => {
        console.log(`Server listening on port ${port}`);
        this.state.status = 'connected';
        this.emit('hosting', { port });
      });

      // Handle server errors
      server.on('error', (error: any) => {
        console.error('Server error:', error);
        this.state.status = 'error';
        this.emit('error', error);
      });

      return true;
    } catch (error: any) {
      console.error('Error starting server:', error);
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

      const client = TcpSocket.createConnection(
        { port, host: address },
        () => {
          console.log('Connected to server');
          this.state.clientSocket = client;
          this.state.status = 'connected';
          this.emit('connected', { role: 'client' });
        }
      );

      client.on('data', (data: any) => {
        try {
          const message: GameMessage = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      client.on('error', (error: any) => {
        console.error('Connection error:', error);
        this.state.status = 'error';
        this.emit('error', error);
      });

      client.on('close', () => {
        console.log('Disconnected from server');
        this.state.status = 'disconnected';
        this.emit('disconnected', {});
        this.disconnect();
      });

      return true;
    } catch (error) {
      console.error('Error joining game:', error);
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
        console.error('Error sending message:', error);
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
  disconnect() {
    if (this.state.serverSocket) {
      try {
        this.state.serverSocket.close();
      } catch (error) {
        console.error('Error closing server:', error);
      }
      this.state.serverSocket = null;
    }

    if (this.state.clientSocket) {
      try {
        this.state.clientSocket.destroy();
      } catch (error) {
        console.error('Error closing client:', error);
      }
      this.state.clientSocket = null;
    }

    this.state.role = null;
    this.state.status = 'disconnected';
    this.state.isMyTurn = false;
    this.emit('disconnected', {});
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

