import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  AuthState, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  WsTicketResponse 
} from '@/types/auth';
import { API_BASE_URL, ENDPOINTS } from '@/constants/api';

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getWsTicket: () => Promise<string | null>;
  fetchUserProfile: () => Promise<void>;
  clearError: () => void;
}

// Generate a unique device ID for this installation
const generateDeviceId = () => {
  return 'device_' + Math.random().toString(36).substring(2, 15);
};

// Get device ID from storage or generate a new one
const getDeviceId = async (): Promise<string> => {
  try {
    const deviceId = await AsyncStorage.getItem('device_id');
    if (deviceId) return deviceId;
    
    const newDeviceId = generateDeviceId();
    await AsyncStorage.setItem('device_id', newDeviceId);
    return newDeviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return generateDeviceId();
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      csrfToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          // If device_id is not provided, get it from storage
          if (!credentials.device_id) {
            credentials.device_id = await getDeviceId();
          }
          
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include', // Important for cookies
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
          }

          const data = await response.json();
          
          // Extract refresh token from cookies if on web
          let refreshToken = null;
          if (Platform.OS === 'web') {
            // In a real app, the refresh token would be in an HTTP-only cookie
            // For this demo, we'll simulate it
            refreshToken = 'simulated-refresh-token';
          }

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REGISTER}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
          }

          const data = await response.json();
          
          // Extract refresh token from cookies if on web
          let refreshToken = null;
          if (Platform.OS === 'web') {
            // In a real app, the refresh token would be in an HTTP-only cookie
            // For this demo, we'll simulate it
            refreshToken = 'simulated-refresh-token';
          }

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Registration error:', error);
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const { refreshToken, accessToken } = get();
          
          if (accessToken) {
            await fetch(`${API_BASE_URL}${ENDPOINTS.LOGOUT}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
              credentials: 'include',
            });
          }
          
          // Clear auth state regardless of API response
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            csrfToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear auth state even if API call fails
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            csrfToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      logoutAll: async () => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken } = get();
          
          if (accessToken) {
            await fetch(`${API_BASE_URL}${ENDPOINTS.LOGOUT_ALL}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              credentials: 'include',
            });
          }
          
          // Clear auth state regardless of API response
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            csrfToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Logout all error:', error);
          // Still clear auth state even if API call fails
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            csrfToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        
        try {
          const deviceId = await getDeviceId();
          
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
              device_id: deviceId,
            }),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          
          set({
            accessToken: data.accessToken,
            csrfToken: data.csrfToken,
          });
          
          return true;
        } catch (error) {
          console.error('Token refresh error:', error);
          // If refresh fails, log the user out
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            csrfToken: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      getWsTicket: async () => {
        const { accessToken, refreshToken } = get();
        
        // If no access token, try to refresh
        if (!accessToken && refreshToken) {
          const refreshed = await get().refreshToken();
          if (!refreshed) return null;
        }
        
        // If still no access token, return null
        if (!get().accessToken) return null;
        
        try {
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.WS_TICKET}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${get().accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to get WebSocket ticket');
          }

          const data: WsTicketResponse = await response.json();
          return data.ticket;
        } catch (error) {
          console.error('WS ticket error:', error);
          return null;
        }
      },

      fetchUserProfile: async () => {
        const { accessToken, refreshToken } = get();
        
        // If no access token, try to refresh
        if (!accessToken && refreshToken) {
          const refreshed = await get().refreshToken();
          if (!refreshed) return;
        }
        
        // If still no access token, return
        if (!get().accessToken) return;
        
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ME}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${get().accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user profile');
          }

          const userData: User = await response.json();
          set({
            user: userData,
            isLoading: false,
          });
        } catch (error) {
          console.error('Profile fetch error:', error);
          set({ isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'hq-trivia-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        csrfToken: state.csrfToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);