import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player } from '@/types/game';

interface UserState {
  player: Player;
  gamesPlayed: number;
  highScore: number;
  totalScore: number;
  totalCorrect: number;
  totalQuestions: number;
  totalWinnings: number;
  
  // Actions
  updatePlayer: (updates: Partial<Player>) => void;
  updateStats: (score: number, correct: number, total: number, winnings?: number) => void;
  resetStats: () => void;
}

const defaultPlayer: Player = {
  id: '0',
  name: 'Player',
  avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop',
  score: 0,
  correctAnswers: 0,
  totalAnswered: 0,
  isActive: true,
  isOnline: true
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      player: defaultPlayer,
      gamesPlayed: 0,
      highScore: 0,
      totalScore: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      totalWinnings: 0,
      
      updatePlayer: (updates) => {
        set((state) => ({
          player: {
            ...state.player,
            ...updates
          }
        }));
      },
      
      updateStats: (score, correct, total, winnings = 0) => {
        set((state) => ({
          gamesPlayed: state.gamesPlayed + 1,
          highScore: Math.max(state.highScore, score),
          totalScore: state.totalScore + score,
          totalCorrect: state.totalCorrect + correct,
          totalQuestions: state.totalQuestions + total,
          totalWinnings: state.totalWinnings + winnings,
          player: {
            ...state.player,
            score: state.player.score + score,
            correctAnswers: state.player.correctAnswers + correct,
            totalAnswered: state.player.totalAnswered + total
          }
        }));
      },
      
      resetStats: () => {
        set({
          gamesPlayed: 0,
          highScore: 0,
          totalScore: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          totalWinnings: 0,
          player: defaultPlayer
        });
      }
    }),
    {
      name: 'hq-trivia-user',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);