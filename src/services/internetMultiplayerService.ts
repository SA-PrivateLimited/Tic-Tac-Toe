import { Board, Player } from '../types/game';

// Firebase will be loaded dynamically
let firebase: any = null;
let database: any = null;
let firebaseAvailable = false;
let firebaseError: string | null = null;

// Try to load Firebase
try {
  const firebaseApp = require('@react-native-firebase/app').default;
  const firebaseDatabase = require('@react-native-firebase/database').default;
  
  if (firebaseApp && firebaseDatabase) {
    firebase = firebaseApp;
    database = firebaseDatabase;
    
    // Check if Firebase is initialized
    try {
      // Try to get the default app - this will throw if not initialized
      // Use getApp() for modern API (React Native Firebase v22+)
      const app = firebase.getApp();
      
      if (app) {
        // Try to access database to verify it's working
        // Use getDatabase() for modern API, fallback to firebaseDatabase() for compatibility
        try {
          const getDatabase = firebaseDatabase.getDatabase || (() => firebaseDatabase());
          const db = getDatabase(app);
          if (db) {
            firebaseAvailable = true;
            firebaseError = null;
            console.log('✅ Firebase initialized successfully');
          } else {
            firebaseAvailable = false;
            firebaseError = 'Database instance not available. Please rebuild the app.';
          }
        } catch (dbError: any) {
          // Database access failed - might be a configuration issue
          firebaseAvailable = false;
          const dbErrorMsg = dbError?.message || 'Database access failed';
          console.log('Firebase database error:', dbErrorMsg);
          firebaseError = `Database error: ${dbErrorMsg}. Please ensure Realtime Database is enabled in Firebase Console.`;
        }
      } else {
        firebaseAvailable = false;
        firebaseError = 'Firebase app not initialized. Please rebuild the app.';
      }
    } catch (initError: any) {
      // Firebase not initialized - need google-services.json or rebuild
      firebaseAvailable = false;
      const errorMsg = initError?.message || 'Firebase initialization failed';
      console.log('Firebase initialization error:', errorMsg);
      if (errorMsg.includes('google-services.json') || errorMsg.includes('No Firebase App')) {
        firebaseError = 'Firebase not configured. Please ensure google-services.json is in android/app/ and rebuild the app.';
      } else {
        firebaseError = `Firebase initialization failed: ${errorMsg}. Please rebuild the app.`;
      }
    }
  } else {
    firebaseAvailable = false;
    firebaseError = 'Firebase modules not found';
  }
} catch (error: any) {
  // Firebase not available - package not installed or not configured
  firebaseAvailable = false;
  firebaseError = error?.message || 'Firebase packages not installed';
  console.log('Firebase module load error:', error);
}

export const isInternetMultiplayerAvailable = (): boolean => {
      // Re-check at runtime in case Firebase was initialized after module load
  if (!firebaseAvailable && firebase && database) {
    try {
      // Use getApp() for modern API (React Native Firebase v22+)
      const app = firebase.getApp();
      if (app) {
        const getDatabase = database.getDatabase || (() => database());
        const db = getDatabase(app);
        if (db) {
          firebaseAvailable = true;
          firebaseError = null;
          console.log('✅ Firebase available (runtime check)');
          return true;
        }
      }
    } catch (e: any) {
      // Still not available
      console.log('Firebase runtime check failed:', e?.message);
    }
  }
  return firebaseAvailable;
};

export const getFirebaseError = () => firebaseError;

export type InternetConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface InternetMultiplayerState {
  status: InternetConnectionStatus;
  roomId: string | null;
  isHost: boolean;
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
  player?: Player;
}

class InternetMultiplayerService {
  private state: InternetMultiplayerState = {
    status: 'disconnected',
    roomId: null,
    isHost: false,
    isMyTurn: false,
    myPlayer: 'X',
    opponentPlayer: 'O',
  };

  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private roomRef: any = null;
  private gameRef: any = null;
  private lastProcessedMove: { index: number; player: Player; timestamp: number } | null = null;
  private isResetting: boolean = false;

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
  getState(): InternetMultiplayerState {
    return { ...this.state };
  }

  // Generate a random room ID
  private generateRoomId(): string {
    // Generate a more collision-resistant room ID
    // Format: 6 uppercase alphanumeric characters
    // Using timestamp + random for better uniqueness
    const timestamp = Date.now().toString(36).toUpperCase().slice(-3);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return (timestamp + random).slice(0, 6);
  }

  // Create a new game room
  async createRoom(): Promise<string> {
    if (!firebaseAvailable || !database) {
      throw new Error('Firebase is not available. Please check Firebase configuration.');
    }

    try {
      // Prevent creating a new room if already connected
      if (this.state.status === 'connected' && this.state.roomId) {
        throw new Error('You are already in a room. Please disconnect before creating a new room.');
      }

      // Disconnect from any previous room first
      if (this.state.roomId) {
        this.disconnect();
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const roomId = this.generateRoomId();
      this.state.roomId = roomId;
      this.state.isHost = true;
      this.state.status = 'connecting';
      this.state.myPlayer = 'X';
      this.state.opponentPlayer = 'O';
      this.state.isMyTurn = true;

      // Use modular API: getDatabase() and ref()
      // Use getApp() for modern API (React Native Firebase v22+)
      const app = firebase.getApp();
      const { getDatabase, ref, set, onDisconnect, remove } = database;
      
      let db;
      if (getDatabase) {
        // Use modern modular API
        db = getDatabase(app);
        this.roomRef = ref(db, `rooms/${roomId}`);
        this.gameRef = ref(db, `games/${roomId}`);
      } else {
        // Fallback to namespaced API
        db = database();
        this.roomRef = db.ref(`rooms/${roomId}`);
        this.gameRef = db.ref(`games/${roomId}`);
      }

      // Create room with host info (using modular API: set())
      if (set) {
        // Use modular API
        console.log('Creating room in Firebase:', roomId);
        try {
          await set(this.roomRef, {
            host: true,
            player2: false,
            createdAt: Date.now(),
          });
          console.log('Room created successfully');
          
          await set(this.gameRef, {
            board: Array(9).fill(null),
            currentPlayer: 'X',
            winner: null,
            isDraw: false,
            lastMove: null,
          });
          console.log('Game state created successfully');
        } catch (setError: any) {
          console.error('Error setting room/game data:', setError);
          throw new Error(`Failed to create room: ${setError?.message || 'Unknown error'}`);
        }
        
        // Set up disconnect cleanup for host (auto-remove room and game)
        if (onDisconnect && remove) {
          try {
            // Use modular API: onDisconnect returns an object with remove method
            const roomDisconnect = onDisconnect(this.roomRef);
            const gameDisconnect = onDisconnect(this.gameRef);
            if (roomDisconnect && typeof roomDisconnect.remove === 'function') {
              roomDisconnect.remove();
            }
            if (gameDisconnect && typeof gameDisconnect.remove === 'function') {
              gameDisconnect.remove();
            }
          } catch (e) {
            // Ignore onDisconnect setup errors
            console.log('onDisconnect setup error (ignored):', e);
          }
        } else if (this.roomRef && this.roomRef.onDisconnect) {
          // Fallback to namespaced API (deprecated)
          try {
            this.roomRef.onDisconnect().remove();
            this.gameRef.onDisconnect().remove();
          } catch (e) {
            console.log('onDisconnect fallback error (ignored):', e);
          }
        }
      } else {
        // Fallback to namespaced API
        await this.roomRef.set({
          host: true,
          player2: false,
          createdAt: Date.now(),
        });
        await this.gameRef.set({
          board: Array(9).fill(null),
          currentPlayer: 'X',
          winner: null,
          isDraw: false,
          lastMove: null,
        });
        
        // Set up disconnect cleanup for host
        if (this.roomRef.onDisconnect) {
          try {
            this.roomRef.onDisconnect().remove();
            this.gameRef.onDisconnect().remove();
          } catch (e) {
            console.log('onDisconnect error (ignored):', e);
          }
        }
      }

      // Listen for player 2 joining
      this.roomRef.on('value', (snapshot: any) => {
        const data = snapshot.val();
        if (data && data.player2 && this.state.status !== 'connected') {
          this.state.status = 'connected';
          this.emit('connected', { role: 'host' });
          // Sync initial game state when connected
          this.gameRef.once('value', (gameSnapshot: any) => {
            const gameData = gameSnapshot.val();
            if (gameData) {
              const currentPlayer = gameData.currentPlayer || 'X';
              const isMyTurn = currentPlayer === this.state.myPlayer;
              this.state.isMyTurn = isMyTurn;
              
              this.emit('sync', {
                board: gameData.board || Array(9).fill(null),
                currentPlayer: currentPlayer,
                winner: gameData.winner !== undefined ? gameData.winner : null,
                isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
              });
              
              // Emit turn update immediately
              this.emit('turn', { currentPlayer, isMyTurn });
            }
          });
        }
      });

      // Get initial currentPlayer value to set turn correctly
      this.gameRef.child('currentPlayer').once('value', (snapshot: any) => {
        const currentPlayer = snapshot.val();
        if (currentPlayer) {
          const isMyTurn = currentPlayer === this.state.myPlayer;
          this.state.isMyTurn = isMyTurn;
          // Emit turn update immediately
          this.emit('turn', { currentPlayer, isMyTurn });
        }
      });

      // Listen for currentPlayer changes to update turn immediately
      this.gameRef.child('currentPlayer').on('value', (snapshot: any) => {
        const currentPlayer = snapshot.val();
        if (currentPlayer) {
          const isMyTurn = currentPlayer === this.state.myPlayer;
          this.state.isMyTurn = isMyTurn;
          // Emit turn update
          this.emit('turn', { currentPlayer, isMyTurn });
        }
      });
      
      // Listen to board changes directly for real-time sync
      // This ensures immediate updates when the board changes in Firebase
      this.gameRef.child('board').on('value', (snapshot: any) => {
        const board = snapshot.val();
        if (board && Array.isArray(board)) {
          // Ensure board is always 9 cells (3x3)
          let fixedBoard = board;
          if (board.length !== 9) {
            fixedBoard = Array(9).fill(null);
            for (let i = 0; i < Math.min(board.length, 9); i++) {
              fixedBoard[i] = board[i];
            }
          }
          
          // Emit sync IMMEDIATELY with board data (no async delay)
          // This ensures opponent moves appear instantly
          // Emit with board immediately, then fetch full state
          this.emit('sync', {
            board: fixedBoard,
            currentPlayer: 'X', // Will be updated by full state fetch
            winner: null, // Will be updated by full state fetch
            isDraw: false, // Will be updated by full state fetch
          });
          
          // Also fetch full state for complete sync (but don't block on it)
          this.gameRef.once('value', (gameSnapshot: any) => {
            const gameData = gameSnapshot.val();
            if (gameData) {
              // Emit sync with complete state
              this.emit('sync', {
                board: fixedBoard,
                currentPlayer: gameData.currentPlayer || 'X',
                winner: gameData.winner !== undefined ? gameData.winner : null,
                isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
              });
            }
          });
        }
      });
      
      // Listen for moves via lastMove changes - sync full board when move received
      // Reset duplicate move tracking for new connection
      this.lastProcessedMove = null;
      
      this.gameRef.child('lastMove').on('value', (snapshot: any) => {
        const lastMove = snapshot.val();
        // Ignore null/empty values (happens on reset)
        if (!lastMove || lastMove === null) {
          return;
        }
        if (lastMove && lastMove.index !== undefined && lastMove.player) {
          // Prevent duplicate processing of the same move
          const now = Date.now();
          
          if (this.lastProcessedMove && 
              this.lastProcessedMove.index === lastMove.index && 
              this.lastProcessedMove.player === lastMove.player &&
              (now - this.lastProcessedMove.timestamp) < 1000) {
            // Same move processed recently, skip
            return;
          }
          
          this.lastProcessedMove = { index: lastMove.index, player: lastMove.player, timestamp: now };
          
          // Get full board state to ensure all 9 cells are synchronized
          this.gameRef.once('value', (gameSnapshot: any) => {
            const gameData = gameSnapshot.val();
            if (gameData && gameData.board) {
              // Ensure board is always 9 cells (3x3)
              let board = Array.isArray(gameData.board) ? gameData.board : Array(9).fill(null);
              if (board.length !== 9) {
                const fixedBoard = Array(9).fill(null);
                for (let i = 0; i < Math.min(board.length, 9); i++) {
                  fixedBoard[i] = board[i];
                }
                board = fixedBoard;
              }
              
              // Emit move with full board state to ensure all 9 cells are updated
              this.emit('move', { 
                index: lastMove.index, 
                player: lastMove.player,
                board: board, // Include full board for synchronization
                currentPlayer: gameData.currentPlayer || 'X'
              });
              
              // ALSO emit sync event for immediate board update
              // This ensures the board updates in real-time even if move handler has issues
              this.emit('sync', {
                board: board,
                currentPlayer: gameData.currentPlayer || 'X',
                winner: gameData.winner !== undefined ? gameData.winner : null,
                isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
              });
            } else {
              // Fallback: just emit the move index
              this.emit('move', { index: lastMove.index, player: lastMove.player });
            }
          });
        }
      });
      
      // Listen for winner/draw changes only (not every board update to prevent refresh)
      this.gameRef.child('winner').on('value', (snapshot: any) => {
        // Ignore if we're currently resetting (prevents refresh on reset)
        if (this.isResetting) {
          return;
        }
        const winner = snapshot.val();
        // Only emit sync if winner is not null (actual win, not reset)
        if (winner !== null && winner !== undefined) {
          // Get full state when winner changes
          this.gameRef.once('value', (gameSnapshot: any) => {
            const gameData = gameSnapshot.val();
            if (gameData) {
              let board = Array.isArray(gameData.board) ? gameData.board : Array(9).fill(null);
              if (board.length !== 9) {
                const fixedBoard = Array(9).fill(null);
                for (let i = 0; i < Math.min(board.length, 9); i++) {
                  fixedBoard[i] = board[i];
                }
                board = fixedBoard;
              }
              this.emit('sync', {
                board: board,
                currentPlayer: gameData.currentPlayer || 'X',
                winner: gameData.winner !== undefined ? gameData.winner : null,
                isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
              });
            }
          });
        }
      });
      
      this.gameRef.child('isDraw').on('value', (snapshot: any) => {
        // Ignore if we're currently resetting (prevents refresh on reset)
        if (this.isResetting) {
          return;
        }
        const isDraw = snapshot.val();
        // Only emit sync if isDraw is true (actual draw, not reset)
        if (isDraw === true) {
          // Get full state when draw changes
          this.gameRef.once('value', (gameSnapshot: any) => {
            const gameData = gameSnapshot.val();
            if (gameData) {
              let board = Array.isArray(gameData.board) ? gameData.board : Array(9).fill(null);
              if (board.length !== 9) {
                const fixedBoard = Array(9).fill(null);
                for (let i = 0; i < Math.min(board.length, 9); i++) {
                  fixedBoard[i] = board[i];
                }
                board = fixedBoard;
              }
              this.emit('sync', {
                board: board,
                currentPlayer: gameData.currentPlayer || 'X',
                winner: gameData.winner !== undefined ? gameData.winner : null,
                isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
              });
            }
          });
        }
      });

      console.log('Room creation complete, roomId:', roomId);
      return roomId;
    } catch (error: any) {
      console.error('createRoom error:', error);
      this.state.status = 'error';
      this.emit('error', error);
      // Clean up on error
      if (this.roomRef) {
        try {
          const { remove } = database;
          if (remove) {
            await remove(this.roomRef);
          } else if (this.roomRef.remove) {
            await this.roomRef.remove();
          }
        } catch (cleanupError) {
          console.log('Cleanup error (ignored):', cleanupError);
        }
      }
      throw error;
    }
  }

  // Join an existing room
  async joinRoom(roomId: string): Promise<boolean> {
    if (!firebaseAvailable || !database) {
      throw new Error('Firebase is not available. Please check Firebase configuration.');
    }

    try {
      // Prevent joining if already connected to a room
      if (this.state.status === 'connected' && this.state.roomId) {
        if (this.state.roomId.toUpperCase() === roomId.toUpperCase()) {
          throw new Error('You are already in this room.');
        } else {
          throw new Error('You are already connected to another room. Please disconnect first.');
        }
      }

      // Prevent host from joining their own room
      if (this.state.isHost && this.state.roomId && this.state.roomId.toUpperCase() === roomId.toUpperCase()) {
        throw new Error('You cannot join your own room from another device. Create a new room or have someone else join.');
      }

      this.state.roomId = roomId.toUpperCase();
      this.state.isHost = false;
      this.state.status = 'connecting';
      this.state.myPlayer = 'O';
      this.state.opponentPlayer = 'X';
      this.state.isMyTurn = false;

      const db = database();
      this.roomRef = db.ref(`rooms/${roomId.toUpperCase()}`);
      this.gameRef = db.ref(`games/${roomId.toUpperCase()}`);

      // Check if room exists
      const roomSnapshot = await this.roomRef.once('value');
      if (!roomSnapshot.exists()) {
        throw new Error('Room not found. Please check the room code.');
      }

      const roomData = roomSnapshot.val();
      if (roomData.player2) {
        throw new Error('Room is full. Another player has already joined.');
      }

      // Use a transaction to atomically check and set player2
      // This prevents race conditions where multiple devices try to join simultaneously
      const { runTransaction, update, onDisconnect } = database;
      let player2Set = false;
      
      if (runTransaction) {
        try {
          const result = await runTransaction(this.roomRef, (currentData: any) => {
            if (currentData === null) {
              return null; // Room doesn't exist
            }
            if (currentData.player2 === true) {
              throw new Error('Room is full. Another player has already joined.');
            }
            return {
              ...currentData,
              player2: true,
            };
          });
          
          if (result === null) {
            throw new Error('Room not found. Please check the room code.');
          }
          player2Set = true; // Transaction successfully set player2
        } catch (error: any) {
          // If transaction fails, throw the error
          throw error;
        }
      }

      // If transaction wasn't used or not available, use regular update
      if (!player2Set) {
        if (update) {
          await update(this.roomRef, { player2: true });
        } else {
          await this.roomRef.update({ player2: true });
        }
      }
      
      // Set up disconnect cleanup for client (remove player2 flag)
      if (onDisconnect && update) {
        // Use modular API: onDisconnect returns an object with update method
        const roomDisconnect = onDisconnect(this.roomRef);
        if (roomDisconnect && typeof roomDisconnect.update === 'function') {
          roomDisconnect.update({ player2: false });
        }
      } else if (this.roomRef && this.roomRef.onDisconnect) {
        // Fallback to namespaced API (deprecated)
        this.roomRef.onDisconnect().update({ player2: false });
      }

      // Reset game board to empty when player joins (new game starts)
      const { update: updateGame } = database;
      if (updateGame) {
        await updateGame(this.gameRef, {
          board: Array(9).fill(null),
          currentPlayer: 'X',
          winner: null,
          isDraw: false,
          lastMove: null,
        });
      } else {
        await this.gameRef.update({
          board: Array(9).fill(null),
          currentPlayer: 'X',
          winner: null,
          isDraw: false,
          lastMove: null,
        });
      }

      this.state.status = 'connected';
      this.emit('connected', { role: 'client' });

      // Get initial currentPlayer value to set turn correctly
      this.gameRef.child('currentPlayer').once('value', (snapshot: any) => {
        const currentPlayer = snapshot.val();
        if (currentPlayer) {
          const isMyTurn = currentPlayer === this.state.myPlayer;
          this.state.isMyTurn = isMyTurn;
          // Emit turn update immediately
          this.emit('turn', { currentPlayer, isMyTurn });
        }
      });

      // Listen for currentPlayer changes to update turn immediately
      this.gameRef.child('currentPlayer').on('value', (snapshot: any) => {
        const currentPlayer = snapshot.val();
        if (currentPlayer) {
          const isMyTurn = currentPlayer === this.state.myPlayer;
          this.state.isMyTurn = isMyTurn;
          // Emit turn update
          this.emit('turn', { currentPlayer, isMyTurn });
        }
      });
      
      // Listen to board changes directly for real-time sync
      // This ensures immediate updates when the board changes in Firebase
      this.gameRef.child('board').on('value', (snapshot: any) => {
        const board = snapshot.val();
        if (board && Array.isArray(board)) {
          // Ensure board is always 9 cells (3x3)
          let fixedBoard = board;
          if (board.length !== 9) {
            fixedBoard = Array(9).fill(null);
            for (let i = 0; i < Math.min(board.length, 9); i++) {
              fixedBoard[i] = board[i];
            }
          }
          
          // Emit sync IMMEDIATELY with board data (no async delay)
          // This ensures opponent moves appear instantly
          // Emit with board immediately, then fetch full state
          this.emit('sync', {
            board: fixedBoard,
            currentPlayer: 'X', // Will be updated by full state fetch
            winner: null, // Will be updated by full state fetch
            isDraw: false, // Will be updated by full state fetch
          });
          
          // Also fetch full state for complete sync (but don't block on it)
          this.gameRef.once('value', (gameSnapshot: any) => {
            const gameData = gameSnapshot.val();
            if (gameData) {
              // Emit sync with complete state
              this.emit('sync', {
                board: fixedBoard,
                currentPlayer: gameData.currentPlayer || 'X',
                winner: gameData.winner !== undefined ? gameData.winner : null,
                isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
              });
            }
          });
        }
      });
      
      // Sync initial game state when connected (for client)
      this.gameRef.once('value', (gameSnapshot: any) => {
        const gameData = gameSnapshot.val();
        if (gameData) {
          const currentPlayer = gameData.currentPlayer || 'X';
          const isMyTurn = currentPlayer === this.state.myPlayer;
          this.state.isMyTurn = isMyTurn;
          
          this.emit('sync', {
            board: gameData.board || Array(9).fill(null),
            currentPlayer: currentPlayer,
            winner: gameData.winner !== undefined ? gameData.winner : null,
            isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
          });
          
          // Emit turn update immediately
          this.emit('turn', { currentPlayer, isMyTurn });
        }
      });
      
      // Listen for moves via lastMove changes - sync full board when move received
      // Reset duplicate move tracking for new connection
      this.lastProcessedMove = null;
      
      this.gameRef.child('lastMove').on('value', (snapshot: any) => {
        const lastMove = snapshot.val();
        // Ignore null/empty values (happens on reset)
        if (!lastMove || lastMove === null) {
          return;
        }
        if (lastMove && lastMove.index !== undefined && lastMove.player) {
          // Prevent duplicate processing of the same move
          const now = Date.now();
          
          if (this.lastProcessedMove && 
              this.lastProcessedMove.index === lastMove.index && 
              this.lastProcessedMove.player === lastMove.player &&
              (now - this.lastProcessedMove.timestamp) < 1000) {
            // Same move processed recently, skip
            return;
          }
          
          this.lastProcessedMove = { index: lastMove.index, player: lastMove.player, timestamp: now };
          
          // Get full board state to ensure all 9 cells are synchronized
          this.gameRef.once('value', (gameSnapshot: any) => {
            const gameData = gameSnapshot.val();
            if (gameData && gameData.board) {
              // Ensure board is always 9 cells (3x3)
              let board = Array.isArray(gameData.board) ? gameData.board : Array(9).fill(null);
              if (board.length !== 9) {
                const fixedBoard = Array(9).fill(null);
                for (let i = 0; i < Math.min(board.length, 9); i++) {
                  fixedBoard[i] = board[i];
                }
                board = fixedBoard;
              }
              
              // Emit move with full board state to ensure all 9 cells are updated
              this.emit('move', { 
                index: lastMove.index, 
                player: lastMove.player,
                board: board, // Include full board for synchronization
                currentPlayer: gameData.currentPlayer || 'X'
              });
              
              // ALSO emit sync event for immediate board update
              // This ensures the board updates in real-time even if move handler has issues
              this.emit('sync', {
                board: board,
                currentPlayer: gameData.currentPlayer || 'X',
                winner: gameData.winner !== undefined ? gameData.winner : null,
                isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
              });
            } else {
              // Fallback: just emit the move index
              this.emit('move', { index: lastMove.index, player: lastMove.player });
            }
          });
        }
      });
      
      // Listen for winner/draw changes only (not every board update to prevent refresh)
      this.gameRef.child('winner').on('value', (snapshot: any) => {
        // Ignore if we're currently resetting (prevents refresh on reset)
        if (this.isResetting) {
          return;
        }
        const winner = snapshot.val();
        // Only emit sync if winner is not null (actual win, not reset)
        if (winner !== null && winner !== undefined) {
          // Get full state when winner changes
          this.gameRef.once('value', (gameSnapshot: any) => {
            const gameData = gameSnapshot.val();
            if (gameData) {
              let board = Array.isArray(gameData.board) ? gameData.board : Array(9).fill(null);
              if (board.length !== 9) {
                const fixedBoard = Array(9).fill(null);
                for (let i = 0; i < Math.min(board.length, 9); i++) {
                  fixedBoard[i] = board[i];
                }
                board = fixedBoard;
              }
              this.emit('sync', {
                board: board,
                currentPlayer: gameData.currentPlayer || 'X',
                winner: gameData.winner !== undefined ? gameData.winner : null,
                isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
              });
            }
          });
        }
      });
      
      this.gameRef.child('isDraw').on('value', (snapshot: any) => {
        // Ignore if we're currently resetting (prevents refresh on reset)
        if (this.isResetting) {
          return;
        }
        const isDraw = snapshot.val();
        // Only emit sync if isDraw is true (actual draw, not reset)
        if (isDraw === true) {
          // Get full state when draw changes
          this.gameRef.once('value', (gameSnapshot: any) => {
            const gameData = gameSnapshot.val();
            if (gameData) {
              let board = Array.isArray(gameData.board) ? gameData.board : Array(9).fill(null);
              if (board.length !== 9) {
                const fixedBoard = Array(9).fill(null);
                for (let i = 0; i < Math.min(board.length, 9); i++) {
                  fixedBoard[i] = board[i];
                }
                board = fixedBoard;
              }
              this.emit('sync', {
                board: board,
                currentPlayer: gameData.currentPlayer || 'X',
                winner: gameData.winner !== undefined ? gameData.winner : null,
                isDraw: gameData.isDraw !== undefined ? gameData.isDraw : false,
              });
            }
          });
        }
      });

      return true;
    } catch (error: any) {
      this.state.status = 'error';
      this.emit('error', error);
      return false;
    }
  }

  // Send a move (like WiFi mode - only send index, not full board)
  // Optionally accepts currentBoard to ensure consistency with local state
  async sendMove(index: number, currentBoard?: Board) {
    if (!this.gameRef || this.state.status !== 'connected') {
      return;
    }

    if (!this.state.isMyTurn) {
      return;
    }

    try {
      let boardToUse: Board;
      
      // If currentBoard is provided, use it (ensures consistency with local state)
      // Otherwise, read from Firebase
      if (currentBoard && Array.isArray(currentBoard) && currentBoard.length === 9) {
        boardToUse = [...currentBoard];
      } else {
        // Get current game state from Firebase to ensure we have latest board
        // This includes all previous moves from both players
        const snapshot = await this.gameRef.once('value');
        const currentData = snapshot.val() || {};
        let firebaseBoard = currentData.board || Array(9).fill(null);
        
        // Ensure board is always 9 cells (3x3) for internet multiplayer
        if (firebaseBoard.length !== 9) {
          firebaseBoard = Array(9).fill(null);
          const sourceBoard = currentData.board || [];
          for (let i = 0; i < Math.min(sourceBoard.length, 9); i++) {
            firebaseBoard[i] = sourceBoard[i];
          }
        }
        boardToUse = firebaseBoard;
      }
      
      // IMPORTANT: Preserve all existing moves - only update the specific cell
      // This ensures previous moves (both yours and opponent's) remain visible
      // Create a copy of the board to preserve all existing moves
      const newBoard = [...boardToUse];
      
      // Only update if cell is empty (safety check)
      if (newBoard[index] === null) {
        newBoard[index] = this.state.myPlayer;
      } else {
        // Cell already occupied - this shouldn't happen but handle gracefully
        // This could happen if there's a race condition, but we should still preserve the board
        return;
      }
      
      // Calculate next player
      const nextPlayer = this.state.myPlayer === 'X' ? 'O' : 'X';
      
      // Update only the changed cell and turn info (using modular API: update())
      const { update } = database;
      if (update) {
        await update(this.gameRef, {
          board: newBoard,
          currentPlayer: nextPlayer,
          lastMove: { index, player: this.state.myPlayer },
        });
      } else {
        await this.gameRef.update({
          board: newBoard,
          currentPlayer: nextPlayer,
          lastMove: { index, player: this.state.myPlayer },
        });
      }

      this.state.isMyTurn = false;

      // Emit move event for local update (only index, like WiFi mode)
      this.emit('move', { index, player: this.state.myPlayer });
    } catch (error) {
      this.emit('error', error);
    }
  }

  // Send reset game
  async sendReset(startingPlayer: Player = 'X') {
    if (!this.gameRef || this.state.status !== 'connected') {
      return;
    }

    try {
      // Set reset flag to prevent sync listeners from firing
      this.isResetting = true;
      
      // Reset duplicate move tracking
      this.lastProcessedMove = null;
      
      // Use modular API if available, fallback to namespaced API
      const { update, remove } = database;
      
      // First, remove lastMove to prevent listeners from firing on old data
      const { child } = database;
      if (remove && child) {
        // Use modular API: child() is a function, not a method
        const lastMoveRef = child(this.gameRef, 'lastMove');
        await remove(lastMoveRef);
      } else if (remove) {
        // Try direct remove on reference (if it's already a child ref)
        await remove(this.gameRef);
      } else {
        // Fallback to namespaced API (deprecated)
        await this.gameRef.child('lastMove').remove();
      }
      
      // Then update the game state
      if (update) {
        await update(this.gameRef, {
          board: Array(9).fill(null),
          currentPlayer: startingPlayer,
          winner: null,
          isDraw: false,
        });
      } else {
        await this.gameRef.update({
          board: Array(9).fill(null),
          currentPlayer: startingPlayer,
          winner: null,
          isDraw: false,
        });
      }

      this.state.isMyTurn = this.state.myPlayer === startingPlayer;
      this.emit('reset', { startingPlayer });
      
      // Clear reset flag after a short delay to allow reset event to process
      setTimeout(() => {
        this.isResetting = false;
      }, 500);
    } catch (error) {
      this.isResetting = false;
      this.emit('error', error);
    }
  }

  // Send game state sync (for winner/draw/reset)
  async sendSync(board: Board, currentPlayer: Player, winner: Player | null, isDraw: boolean) {
    if (!this.gameRef || this.state.status !== 'connected') {
      return;
    }

    try {
      // Ensure board is always 9 cells (3x3) for internet multiplayer
      let fixedBoard = Array.isArray(board) ? board : Array(9).fill(null);
      if (fixedBoard.length !== 9) {
        fixedBoard = Array(9).fill(null);
        for (let i = 0; i < Math.min(board.length, 9); i++) {
          fixedBoard[i] = board[i];
        }
      }
      
      await this.gameRef.update({
        board: fixedBoard,
        currentPlayer,
        winner,
        isDraw,
      });
    } catch (error) {
      this.emit('error', error);
    }
  }

  // Set turn
  setMyTurn(isMyTurn: boolean) {
    this.state.isMyTurn = isMyTurn;
  }

  // Disconnect
  disconnect() {
    // Cancel onDisconnect handlers before manual cleanup (for graceful disconnect)
    if (this.roomRef) {
      // Cancel disconnect handlers to prevent auto-cleanup during graceful disconnect
      const { cancel } = database;
      if (cancel && this.roomRef.onDisconnect) {
        try {
          cancel(this.roomRef.onDisconnect());
        } catch (e) {
          // Ignore if cancel fails (may not be set up yet)
        }
      } else if (this.roomRef.onDisconnect && typeof this.roomRef.onDisconnect().cancel === 'function') {
        try {
          this.roomRef.onDisconnect().cancel();
        } catch (e) {
          // Ignore if cancel fails
        }
      }
      
      this.roomRef.off();
      this.roomRef = null;
    }

    if (this.gameRef) {
      // Cancel disconnect handlers
      const { cancel } = database;
      if (cancel && this.gameRef.onDisconnect) {
        try {
          cancel(this.gameRef.onDisconnect());
        } catch (e) {
          // Ignore if cancel fails
        }
      } else if (this.gameRef.onDisconnect && typeof this.gameRef.onDisconnect().cancel === 'function') {
        try {
          this.gameRef.onDisconnect().cancel();
        } catch (e) {
          // Ignore if cancel fails
        }
      }
      
      this.gameRef.off();
      this.gameRef = null;
    }

    // Clean up room if host (manual cleanup for graceful disconnect)
    if (this.state.isHost && this.state.roomId) {
      try {
        const app = firebase.getApp();
        const { getDatabase, ref, remove } = database;
        if (getDatabase && ref && remove) {
          // Use modular API
          const db = getDatabase(app);
          remove(ref(db, `rooms/${this.state.roomId}`));
          remove(ref(db, `games/${this.state.roomId}`));
        } else {
          // Fallback to namespaced API (deprecated but still works)
          const db = database();
          if (db) {
            db.ref(`rooms/${this.state.roomId}`).remove();
            db.ref(`games/${this.state.roomId}`).remove();
          }
        }
      } catch (e) {
        // Ignore cleanup errors
        console.log('Cleanup error (ignored):', e);
      }
    }

    this.state.status = 'disconnected';
    this.state.roomId = null;
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

  // Get room ID
  getRoomId(): string | null {
    return this.state.roomId;
  }
}

export const internetMultiplayerService = new InternetMultiplayerService();

