import { create } from 'zustand';
import { Platform } from 'react-native';
import { WS_BASE_URL, WS_MESSAGE_TYPES } from '@/constants/api';
import { useAuthStore } from './auth-store';
import { useQuizStore } from './quiz-store';

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  error: string | null;
}

interface WebSocketStore extends WebSocketState {
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (type: string, data: any) => void;
}

// Maximum number of reconnect attempts
const MAX_RECONNECT_ATTEMPTS = 10;

// Base delay for exponential backoff (in ms)
const BASE_RECONNECT_DELAY = 1000;

// Maximum delay for reconnect (in ms)
const MAX_RECONNECT_DELAY = 30000;

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  reconnectAttempts: 0,
  error: null,

  connect: async () => {
    // If already connected or connecting, do nothing
    if (get().isConnected || get().isConnecting) return;

    set({ isConnecting: true, error: null });

    try {
      // Get WebSocket ticket from auth store
      const authStore = useAuthStore.getState();
      const ticket = await authStore.getWsTicket();

      if (!ticket) {
        throw new Error('Failed to get WebSocket ticket');
      }

      // Create WebSocket connection
      const wsUrl = `${WS_BASE_URL}/ws?ticket=${ticket}`;
      const socket = new WebSocket(wsUrl);

      // Set up event handlers
      socket.onopen = () => {
        console.log('WebSocket connected');
        set({
          socket,
          isConnected: true,
          isConnecting: false,
          reconnectAttempts: 0,
          error: null,
        });
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({
          error: 'WebSocket connection error',
          isConnecting: false,
        });
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        set({
          socket: null,
          isConnected: false,
          isConnecting: false,
        });

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000) {
          handleReconnect();
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to connect to WebSocket',
        isConnecting: false,
      });

      // Attempt to reconnect
      handleReconnect();
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close(1000, 'Normal closure');
      set({
        socket: null,
        isConnected: false,
        isConnecting: false,
        reconnectAttempts: 0,
      });
    }
  },

  sendMessage: (type, data) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      const message = JSON.stringify({
        type,
        data,
      });
      socket.send(message);
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  },
}));

// Handle incoming WebSocket messages
const handleWebSocketMessage = (message: { type: string; data: any }) => {
  const quizStore = useQuizStore.getState();
  const authStore = useAuthStore.getState();

  switch (message.type) {
    case WS_MESSAGE_TYPES.QUIZ_START:
      quizStore.setQuizStart(message.data);
      break;

    case WS_MESSAGE_TYPES.QUIZ_END:
      quizStore.setQuizEnd(message.data);
      break;

    case WS_MESSAGE_TYPES.QUESTION_START:
      quizStore.setCurrentQuestion(message.data);
      break;

    case WS_MESSAGE_TYPES.QUESTION_END:
      quizStore.setQuestionResults(message.data);
      break;

    case WS_MESSAGE_TYPES.RESULT_UPDATE:
      quizStore.updateUserResult(message.data);
      break;

    case WS_MESSAGE_TYPES.TOKEN_EXPIRE_SOON:
      // Refresh token if it's about to expire
      authStore.refreshToken();
      break;

    case WS_MESSAGE_TYPES.TOKEN_EXPIRED:
      // Handle token expiration
      authStore.logout();
      break;

    default:
      console.warn('Unknown WebSocket message type:', message.type);
  }
};

// Handle reconnection with exponential backoff
const handleReconnect = () => {
  const { reconnectAttempts } = useWebSocketStore.getState();

  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    // Calculate delay with exponential backoff
    const delay = Math.min(
      BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
      MAX_RECONNECT_DELAY
    );

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1})`);

    // Increment reconnect attempts
    useWebSocketStore.setState({ reconnectAttempts: reconnectAttempts + 1 });

    // Schedule reconnect
    setTimeout(() => {
      useWebSocketStore.getState().connect();
    }, delay);
  } else {
    console.error('Maximum reconnect attempts reached');
    useWebSocketStore.setState({
      error: 'Failed to connect after multiple attempts',
    });
  }
};