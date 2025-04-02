import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Quiz, 
  QuizResult, 
  Question, 
  WsQuestionStartMessage,
  WsQuestionEndMessage,
  WsQuizStartMessage,
  WsQuizEndMessage,
  WsResultUpdateMessage
} from '@/types/quiz';
import { API_BASE_URL, ENDPOINTS } from '@/constants/api';
import { useAuthStore } from './auth-store';

interface QuizState {
  scheduledQuizzes: Quiz[];
  activeQuiz: Quiz | null;
  currentQuestion: WsQuestionStartMessage | null;
  questionResults: WsQuestionEndMessage | null;
  quizResults: QuizResult[];
  userResult: QuizResult | null;
  selectedAnswer: number | null;
  isAnswerSubmitted: boolean;
  isEliminated: boolean;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

interface QuizStore extends QuizState {
  fetchScheduledQuizzes: () => Promise<void>;
  fetchActiveQuiz: () => Promise<Quiz | null>;
  fetchQuizResults: (quizId: string) => Promise<void>;
  fetchUserResult: (quizId: string) => Promise<void>;
  setCurrentQuestion: (question: WsQuestionStartMessage | null) => void;
  setQuestionResults: (results: WsQuestionEndMessage | null) => void;
  setQuizStart: (quizStart: WsQuizStartMessage) => void;
  setQuizEnd: (quizEnd: WsQuizEndMessage) => void;
  updateUserResult: (result: WsResultUpdateMessage) => void;
  selectAnswer: (optionId: number) => void;
  submitAnswer: (quizId: string, questionId: string) => Promise<boolean>;
  markAsReady: (quizId: string) => Promise<boolean>;
  resetQuizState: () => void;
  clearError: () => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      scheduledQuizzes: [],
      activeQuiz: null,
      currentQuestion: null,
      questionResults: null,
      quizResults: [],
      userResult: null,
      selectedAnswer: null,
      isAnswerSubmitted: false,
      isEliminated: false,
      isReady: false,
      isLoading: false,
      error: null,

      fetchScheduledQuizzes: async () => {
        set({ isLoading: true, error: null });
        try {
          const authStore = useAuthStore.getState();
          
          // If not authenticated, return
          if (!authStore.accessToken) {
            set({ isLoading: false });
            return;
          }
          
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SCHEDULED_QUIZZES}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch scheduled quizzes');
          }

          const data = await response.json();
          set({
            scheduledQuizzes: data.quizzes,
            isLoading: false,
          });
        } catch (error) {
          console.error('Fetch scheduled quizzes error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch scheduled quizzes',
            isLoading: false,
          });
        }
      },

      fetchActiveQuiz: async () => {
        set({ isLoading: true, error: null });
        try {
          const authStore = useAuthStore.getState();
          
          // If not authenticated, return
          if (!authStore.accessToken) {
            set({ isLoading: false });
            return null;
          }
          
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ACTIVE_QUIZ}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`,
            },
          });

          if (response.status === 404) {
            // No active quiz is not an error
            set({
              activeQuiz: null,
              isLoading: false,
            });
            return null;
          }

          if (!response.ok) {
            throw new Error('Failed to fetch active quiz');
          }

          const quiz: Quiz = await response.json();
          set({
            activeQuiz: quiz,
            isLoading: false,
          });
          return quiz;
        } catch (error) {
          console.error('Fetch active quiz error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch active quiz',
            isLoading: false,
          });
          return null;
        }
      },

      fetchQuizResults: async (quizId: string) => {
        set({ isLoading: true, error: null });
        try {
          const authStore = useAuthStore.getState();
          
          // If not authenticated, return
          if (!authStore.accessToken) {
            set({ isLoading: false });
            return;
          }
          
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.QUIZ_RESULTS(quizId)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch quiz results');
          }

          const data = await response.json();
          set({
            quizResults: data.results,
            isLoading: false,
          });
        } catch (error) {
          console.error('Fetch quiz results error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch quiz results',
            isLoading: false,
          });
        }
      },

      fetchUserResult: async (quizId: string) => {
        set({ isLoading: true, error: null });
        try {
          const authStore = useAuthStore.getState();
          
          // If not authenticated, return
          if (!authStore.accessToken) {
            set({ isLoading: false });
            return;
          }
          
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USER_RESULTS(quizId)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user result');
          }

          const result: QuizResult = await response.json();
          set({
            userResult: result,
            isLoading: false,
          });
        } catch (error) {
          console.error('Fetch user result error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch user result',
            isLoading: false,
          });
        }
      },

      setCurrentQuestion: (question) => {
        set({
          currentQuestion: question,
          questionResults: null,
          selectedAnswer: null,
          isAnswerSubmitted: false,
        });
      },

      setQuestionResults: (results) => {
        set({ questionResults: results });
      },

      setQuizStart: (quizStart) => {
        const quiz: Quiz = {
          id: quizStart.quiz_id,
          title: quizStart.title,
          description: '',
          scheduled_time: quizStart.start_time,
          status: 'in_progress',
          question_count: quizStart.total_questions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        set({
          activeQuiz: quiz,
          isEliminated: false,
          isReady: true,
        });
      },

      setQuizEnd: (quizEnd) => {
        // Update active quiz status if it exists
        if (get().activeQuiz && get().activeQuiz.id === quizEnd.quiz_id) {
          set({
            activeQuiz: {
              ...get().activeQuiz,
              status: 'completed',
            },
            currentQuestion: null,
            questionResults: null,
          });
        }
      },

      updateUserResult: (result) => {
        // Update user result
        set({
          userResult: {
            ...get().userResult || {
              id: '0',
              user_id: result.user_id,
              quiz_id: result.quiz_id,
              username: '',
              profile_picture: '',
              prize_fund: 0,
              completed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              is_winner: false,
              rank: result.rank,
            },
            score: result.score,
            correct_answers: result.correct_answers,
            total_questions: result.total_questions,
            rank: result.rank,
          },
          isEliminated: result.is_eliminated,
        });
      },

      selectAnswer: (optionId) => {
        set({ selectedAnswer: optionId });
      },

      submitAnswer: async (quizId, questionId) => {
        const { selectedAnswer } = get();
        if (selectedAnswer === null) return false;
        
        try {
          // In a real app, this would send the answer to the WebSocket
          // For this demo, we'll simulate it
          set({ isAnswerSubmitted: true });
          
          // Simulate WebSocket message
          const timestamp = Date.now();
          console.log('Submitting answer:', {
            quiz_id: quizId,
            question_id: questionId,
            selected_option: selectedAnswer,
            timestamp,
          });
          
          return true;
        } catch (error) {
          console.error('Submit answer error:', error);
          return false;
        }
      },

      markAsReady: async (quizId) => {
        try {
          // In a real app, this would send the ready status to the WebSocket
          // For this demo, we'll simulate it
          console.log('Marking as ready for quiz:', quizId);
          set({ isReady: true });
          return true;
        } catch (error) {
          console.error('Mark as ready error:', error);
          return false;
        }
      },

      resetQuizState: () => {
        set({
          currentQuestion: null,
          questionResults: null,
          selectedAnswer: null,
          isAnswerSubmitted: false,
          isEliminated: false,
          isReady: false,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'hq-trivia-quiz',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        userResult: state.userResult,
        quizResults: state.quizResults,
      }),
    }
  )
);