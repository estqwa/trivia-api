export interface Quiz {
  id: string;
  title: string;
  description: string;
  scheduled_time: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  text: string;
  options: string[];
  time_limit_sec: number;
  point_value: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: number;
  text: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  username: string;
  profile_picture: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  rank: number;
  is_winner: boolean;
  prize_fund: number;
  completed_at: string;
  created_at: string;
}

export interface UserAnswer {
  id: string;
  user_id: string;
  quiz_id: string;
  question_id: string;
  selected_option: number;
  is_correct: boolean;
  response_time_ms: number;
  score: number;
  is_eliminated: boolean;
  created_at: string;
}

// WebSocket message types
export interface WsQuizStartMessage {
  quiz_id: string;
  title: string;
  total_questions: number;
  prize_fund: number;
  start_time: string;
}

export interface WsQuizEndMessage {
  quiz_id: string;
  total_players: number;
  winners_count: number;
  prize_per_winner: number;
}

export interface WsQuestionStartMessage {
  quiz_id: string;
  question_id: string;
  question_number: number;
  text: string;
  options: QuestionOption[];
  time_limit_sec: number;
  point_value: number;
  start_time: string;
}

export interface WsQuestionEndMessage {
  quiz_id: string;
  question_id: string;
  question_number: number;
  correct_option: number;
  stats: {
    total_answers: number;
    option_distribution: number[];
    correct_percentage: number;
    average_response_time_ms: number;
  };
}

export interface WsResultUpdateMessage {
  quiz_id: string;
  user_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  rank: number;
  total_players: number;
  is_eliminated: boolean;
}

export interface WsUserAnswerMessage {
  quiz_id: string;
  question_id: string;
  selected_option: number;
  timestamp: number;
}

export interface WsUserReadyMessage {
  quiz_id: string;
}