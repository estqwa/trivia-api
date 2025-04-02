import { create } from 'zustand';
import { Platform } from 'react-native';
import { GameSocketMessage, Player } from '@/types/game';

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  players: Player[];
  roomId: string | null;
  
  // Actions
  connect: (username: string, avatar: string) => void;
  disconnect: () => void;
  sendMessage: (message: GameSocketMessage) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
}

// Mock WebSocket URL - in a real app, this would be your actual WebSocket server
const WS_URL = Platform.OS === 'web' 
  ? 'wss://mock-hq-trivia-server.glitch.me' 
  : 'wss://mock-hq-trivia-server.glitch.me';

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  players: [],
  roomId: null,
  
  connect: (username, avatar) => {
    // Close existing connection if any
    if (get().socket) {
      get().socket?.close();
    }
    
    try {
      // In a real app, we would connect to an actual WebSocket server
      // For this demo, we'll simulate WebSocket behavior
      const mockSocket = new MockWebSocket(WS_URL);
      
      mockSocket.onopen = () => {
        set({ isConnected: true });
        console.log('WebSocket connected');
        
        // Send player info
        get().sendMessage({
          type: 'join',
          payload: {
            player: {
              id: Math.random().toString(36).substring(2, 9),
              name: username,
              avatar,
              score: 0,
              correctAnswers: 0,
              totalAnswered: 0,
              isActive: true,
              isOnline: true
            }
          }
        });
      };
      
      mockSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Handle different message types
          switch (data.type) {
            case 'playerUpdate':
              set({ players: data.payload.players });
              break;
            case 'gameStart':
              // Handle game start
              break;
            case 'nextQuestion':
              // Handle next question
              break;
            case 'gameEnd':
              // Handle game end
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      mockSocket.onclose = () => {
        set({ isConnected: false });
        console.log('WebSocket disconnected');
      };
      
      mockSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      set({ socket: mockSocket as unknown as WebSocket });
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  },
  
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },
  
  sendMessage: (message) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  },
  
  joinRoom: (roomId) => {
    const { isConnected } = get();
    if (isConnected) {
      get().sendMessage({
        type: 'join',
        payload: { roomId }
      });
      set({ roomId });
    }
  },
  
  leaveRoom: () => {
    const { roomId, isConnected } = get();
    if (roomId && isConnected) {
      get().sendMessage({
        type: 'leave',
        payload: { roomId }
      });
      set({ roomId: null });
    }
  }
}));

// Mock WebSocket implementation for demo purposes
class MockWebSocket {
  url: string;
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  
  constructor(url: string) {
    this.url = url;
    
    // Simulate connection
    setTimeout(() => {
      if (this.onopen) {
        this.onopen({ type: 'open' });
      }
      
      // Simulate receiving player list after connection
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              type: 'playerUpdate',
              payload: {
                players: [
                  {
                    id: '1',
                    name: 'Alex Johnson',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
                    score: 0,
                    correctAnswers: 0,
                    totalAnswered: 0,
                    isActive: true,
                    isOnline: true
                  },
                  {
                    id: '2',
                    name: 'Samantha Lee',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                    score: 0,
                    correctAnswers: 0,
                    totalAnswered: 0,
                    isActive: true,
                    isOnline: true
                  },
                  {
                    id: '3',
                    name: 'Michael Chen',
                    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
                    score: 0,
                    correctAnswers: 0,
                    totalAnswered: 0,
                    isActive: true,
                    isOnline: true
                  }
                ]
              }
            })
          });
        }
      }, 500);
    }, 500);
  }
  
  send(data: string) {
    console.log('Mock WebSocket sending data:', data);
    
    // Simulate responses based on message type
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'answer':
          // Simulate player updates after answer
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
                  type: 'playerUpdate',
                  payload: {
                    players: [
                      {
                        id: '1',
                        name: 'Alex Johnson',
                        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
                        score: message.payload.isCorrect ? 100 : 0,
                        correctAnswers: message.payload.isCorrect ? 1 : 0,
                        totalAnswered: 1,
                        isActive: !message.payload.isEliminated,
                        isOnline: true
                      },
                      {
                        id: '2',
                        name: 'Samantha Lee',
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                        score: 100,
                        correctAnswers: 1,
                        totalAnswered: 1,
                        isActive: true,
                        isOnline: true
                      },
                      {
                        id: '3',
                        name: 'Michael Chen',
                        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
                        score: 0,
                        correctAnswers: 0,
                        totalAnswered: 1,
                        isActive: false,
                        isOnline: true
                      }
                    ]
                  }
                })
              });
            }
          }, 300);
          break;
          
        case 'gameStart':
          // Simulate game start confirmation
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
                  type: 'gameStart',
                  payload: {
                    roomId: 'game-' + Math.random().toString(36).substring(2, 9),
                    players: 3,
                    prizePool: message.payload.prizePool
                  }
                })
              });
            }
          }, 300);
          break;
      }
    } catch (error) {
      console.error('Error processing mock message:', error);
    }
  }
  
  close() {
    if (this.onclose) {
      this.onclose({ type: 'close' });
    }
  }
}