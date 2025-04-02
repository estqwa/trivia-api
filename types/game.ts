export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  isActive: boolean; // Whether player is still in the game or eliminated
  isOnline: boolean; // Whether player is connected
}

export interface GameState {
  status: 'idle' | 'waiting' | 'countdown' | 'playing' | 'reviewing' | 'results';
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  timeRemaining: number;
  score: number;
  streak: number;
  isEliminated: boolean; // Whether current player is eliminated
  totalPlayers: number; // Total players who started the game
  activePlayers: number; // Players still in the game
  prizePool: number; // Total prize amount
  answeredQuestions: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export interface GameSocketMessage {
  type: 'join' | 'leave' | 'answer' | 'nextQuestion' | 'gameStart' | 'gameEnd' | 'playerUpdate';
  payload: any;
}

export interface GameRoom {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  currentQuestion: number;
  startTime?: number;
}