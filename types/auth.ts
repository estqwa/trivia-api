export interface User {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
  games_played: number;
  total_score: number;
  highest_score: number;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_id?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
  device_id: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  csrfToken: string;
  userId: string;
}

export interface WsTicketResponse {
  ticket: string;
  expires_in: number;
}