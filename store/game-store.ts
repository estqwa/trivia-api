import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Question, GameSocketMessage } from '@/types/game';
import { getRandomQuestions } from '@/mocks/questions';
import { useSocketStore } from './socket-store';

interface GameStore {
  // Game state
  gameState: GameState;
  questions: Question[];
  
  // Actions
  initGame: (questionCount?: number, prizePool?: number) => void;
  startGame: () => void;
  selectAnswer: (answerIndex: number) => void;
  nextQuestion: () => void;
  updateTimer: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Spectator mode
  setEliminated: (value: boolean) => void;
  updateActivePlayers: (count: number) => void;
}

const initialGameState: GameState = {
  status: 'idle',
  currentQuestionIndex: 0,
  selectedAnswer: null,
  timeRemaining: 0,
  score: 0,
  streak: 0,
  isEliminated: false,
  totalPlayers: 0,
  activePlayers: 0,
  prizePool: 1000, // Default prize pool
  answeredQuestions: [],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: initialGameState,
      questions: [],

      initGame: (questionCount = 10, prizePool = 1000) => {
        const questions = getRandomQuestions(questionCount);
        set({
          questions,
          gameState: {
            ...initialGameState,
            status: 'countdown',
            prizePool,
            totalPlayers: 1, // Will be updated by socket
            activePlayers: 1, // Will be updated by socket
          }
        });
        
        // Notify socket that we're starting a game
        const socketStore = useSocketStore.getState();
        if (socketStore.isConnected) {
          socketStore.sendMessage({
            type: 'gameStart',
            payload: {
              questions: questions.length,
              prizePool
            }
          });
        }
      },

      startGame: () => {
        const { questions } = get();
        if (questions.length === 0) return;
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            status: 'playing',
            timeRemaining: questions[0].timeLimit,
          }
        }));
        
        // Notify socket that the game has started
        const socketStore = useSocketStore.getState();
        if (socketStore.isConnected) {
          socketStore.sendMessage({
            type: 'nextQuestion',
            payload: {
              questionIndex: 0
            }
          });
        }
      },

      selectAnswer: (answerIndex: number) => {
        const { gameState, questions } = get();
        if (gameState.status !== 'playing' || gameState.selectedAnswer !== null || gameState.isEliminated) return;

        const currentQuestion = questions[gameState.currentQuestionIndex];
        const isCorrect = answerIndex === currentQuestion.correctAnswer;
        const timeSpent = currentQuestion.timeLimit - gameState.timeRemaining;

        // Calculate points - more points for faster answers
        const timeBonus = Math.max(0, Math.floor(gameState.timeRemaining / currentQuestion.timeLimit * 50));
        const pointsEarned = isCorrect ? (currentQuestion.points + timeBonus) : 0;
        
        // Update streak
        const newStreak = isCorrect ? gameState.streak + 1 : 0;
        
        // Apply streak bonus (10% per streak, max 100%)
        const streakMultiplier = Math.min(2, 1 + (newStreak * 0.1));
        const finalPoints = Math.floor(pointsEarned * streakMultiplier);
        
        // Check if player is eliminated
        const isEliminated = !isCorrect;

        set((state) => ({
          gameState: {
            ...state.gameState,
            status: 'reviewing',
            selectedAnswer: answerIndex,
            score: state.gameState.score + finalPoints,
            streak: newStreak,
            isEliminated: state.gameState.isEliminated || isEliminated,
            activePlayers: isEliminated ? state.gameState.activePlayers - 1 : state.gameState.activePlayers,
            answeredQuestions: [
              ...state.gameState.answeredQuestions,
              {
                questionId: currentQuestion.id,
                selectedAnswer: answerIndex,
                isCorrect,
                timeSpent
              }
            ]
          }
        }));
        
        // Send answer to socket
        const socketStore = useSocketStore.getState();
        if (socketStore.isConnected) {
          socketStore.sendMessage({
            type: 'answer',
            payload: {
              questionIndex: gameState.currentQuestionIndex,
              answerIndex,
              isCorrect,
              isEliminated
            }
          });
        }
        
        // Automatically move to next question after a short delay
        setTimeout(() => {
          get().nextQuestion();
        }, 2000);
      },

      nextQuestion: () => {
        const { gameState, questions } = get();
        const nextIndex = gameState.currentQuestionIndex + 1;
        
        // Check if game should end
        if (nextIndex >= questions.length || gameState.activePlayers === 0) {
          set((state) => ({
            gameState: {
              ...state.gameState,
              status: 'results'
            }
          }));
          
          // Notify socket that the game has ended
          const socketStore = useSocketStore.getState();
          if (socketStore.isConnected) {
            socketStore.sendMessage({
              type: 'gameEnd',
              payload: {
                activePlayers: gameState.activePlayers,
                prizePerPlayer: gameState.activePlayers > 0 
                  ? Math.floor(gameState.prizePool / gameState.activePlayers) 
                  : 0
              }
            });
          }
          
          return;
        }
        
        // Move to next question
        set((state) => ({
          gameState: {
            ...state.gameState,
            status: 'playing',
            currentQuestionIndex: nextIndex,
            selectedAnswer: null,
            timeRemaining: questions[nextIndex].timeLimit
          }
        }));
        
        // Notify socket about next question
        const socketStore = useSocketStore.getState();
        if (socketStore.isConnected) {
          socketStore.sendMessage({
            type: 'nextQuestion',
            payload: {
              questionIndex: nextIndex
            }
          });
        }
      },

      updateTimer: () => {
        const { gameState } = get();
        if (gameState.status !== 'playing') return;
        
        if (gameState.timeRemaining <= 0) {
          // Time's up - treat as wrong answer
          get().selectAnswer(-1); // Invalid answer index to mark as incorrect
          return;
        }
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            timeRemaining: state.gameState.timeRemaining - 1
          }
        }));
      },

      endGame: () => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            status: 'results'
          }
        }));
      },

      resetGame: () => {
        set({
          gameState: initialGameState,
          questions: []
        });
      },
      
      setEliminated: (value) => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            isEliminated: value
          }
        }));
      },
      
      updateActivePlayers: (count) => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            activePlayers: count
          }
        }));
      }
    }),
    {
      name: 'hq-trivia-game',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist high scores and stats, not active game
        gameState: {
          score: state.gameState.score,
          answeredQuestions: state.gameState.answeredQuestions,
        }
      }),
    }
  )
);