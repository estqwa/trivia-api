// API configuration
export const API_BASE_URL = 'https://api.hqtrivia-example.com';
export const WS_BASE_URL = 'wss://ws.hqtrivia-example.com';

// API endpoints
export const ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  LOGOUT_ALL: '/auth/logout/all',
  ME: '/auth/me',
  WS_TICKET: '/auth/ws-ticket',
  
  // Quizzes
  SCHEDULED_QUIZZES: '/api/quizzes/scheduled',
  ACTIVE_QUIZ: '/api/quizzes/active',
  QUIZ_DETAILS: (id: string) => `/api/quizzes/${id}`,
  QUIZ_RESULTS: (id: string) => `/api/quizzes/${id}/results`,
  USER_RESULTS: (id: string) => `/api/quizzes/${id}/results/user`,
};

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  // Server to client
  QUIZ_START: 'QUIZ_START',
  QUIZ_END: 'QUIZ_END',
  QUESTION_START: 'QUESTION_START',
  QUESTION_END: 'QUESTION_END',
  RESULT_UPDATE: 'RESULT_UPDATE',
  TOKEN_EXPIRE_SOON: 'TOKEN_EXPIRE_SOON',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Client to server
  USER_ANSWER: 'USER_ANSWER',
  USER_READY: 'USER_READY',
};