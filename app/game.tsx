import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Animated, 
  Dimensions,
  BackHandler,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { AlertTriangle, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGameStore } from '@/store/game-store';
import { useUserStore } from '@/store/user-store';
import QuestionCard from '@/components/QuestionCard';
import AnswerOption from '@/components/AnswerOption';
import CountdownTimer from '@/components/CountdownTimer';
import Button from '@/components/Button';
import { useSocketStore } from '@/store/socket-store';
import { Player } from '@/types/game';

// Mock components to avoid errors
const MockPlayerList = ({ players }: { players?: Player[] }) => (
  <View style={{ padding: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, margin: 16 }}>
    <Text style={{ color: Colors.dark.text, fontWeight: 'bold' }}>
      Players: {players?.filter(p => p.isActive)?.length || 0} active / {players?.length || 0} total
    </Text>
  </View>
);

const MockPrizePool = () => (
  <View style={{ padding: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, margin: 16 }}>
    <Text style={{ color: Colors.dark.warning, fontWeight: 'bold', textAlign: 'center' }}>
      Prize Pool: $10,000
    </Text>
    <Text style={{ color: Colors.dark.text, textAlign: 'center' }}>
      $100 per player
    </Text>
  </View>
);

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const router = useRouter();
  const gameState = useGameStore((state) => state.gameState);
  const questions = useGameStore((state) => state.questions);
  const startGame = useGameStore((state) => state.startGame);
  const selectAnswer = useGameStore((state) => state.selectAnswer);
  const updateTimer = useGameStore((state) => state.updateTimer);
  const resetGame = useGameStore((state) => state.resetGame);
  const updateStats = useUserStore((state) => state.updateStats);
  
  const { players } = useSocketStore();
  
  const [countdown, setCountdown] = useState(3);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;
  
  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.status === 'countdown') {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (gameState.status === 'playing') {
      interval = setInterval(() => {
        updateTimer();
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameState.status]);
  
  // Animations
  useEffect(() => {
    if (gameState.status === 'playing' || gameState.status === 'reviewing') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(width);
    }
  }, [gameState.status, gameState.currentQuestionIndex]);
  
  // Handle back button
  useEffect(() => {
    const backAction = () => {
      if (gameState.status !== 'idle') {
        resetGame();
        router.back();
        return true;
      }
      return false;
    };
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    
    return () => backHandler.remove();
  }, [gameState.status]);
  
  // Update user stats when game ends
  useEffect(() => {
    if (gameState.status === 'results') {
      const correctAnswers = gameState.answeredQuestions.filter(q => q.isCorrect).length;
      updateStats(
        gameState.score,
        correctAnswers,
        gameState.answeredQuestions.length
      );
    }
  }, [gameState.status]);
  
  const handleSelectAnswer = (index: number) => {
    selectAnswer(index);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const handleFinishGame = () => {
    resetGame();
    router.back();
  };
  
  const handlePlayAgain = () => {
    resetGame();
    router.replace('/');
  };
  
  // Render countdown screen
  if (gameState.status === 'countdown') {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[Colors.dark.primary, Colors.dark.background]}
          style={styles.fullScreen}
        >
          <Text style={styles.getReadyText}>Get Ready!</Text>
          <Text style={styles.countdownText}>{countdown}</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  // Render results screen
  if (gameState.status === 'results') {
    const correctAnswers = gameState.answeredQuestions.filter(q => q.isCorrect).length;
    const accuracy = Math.round((correctAnswers / gameState.answeredQuestions.length) * 100);
    const prizePerPlayer = gameState.activePlayers > 0 
      ? Math.floor(gameState.prizePool / gameState.activePlayers) 
      : 0;
    
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.resultsScrollContent}>
          <LinearGradient
            colors={[Colors.dark.background, Colors.dark.primary]}
            style={styles.resultsContainer}
          >
            <Text style={styles.resultsTitle}>Game Over!</Text>
            
            {gameState.isEliminated ? (
              <View style={styles.eliminatedMessage}>
                <AlertTriangle size={30} color={Colors.dark.error} />
                <Text style={styles.eliminatedText}>You were eliminated</Text>
              </View>
            ) : (
              <View style={styles.winnerMessage}>
                <Text style={styles.winnerText}>
                  You made it to the end!
                </Text>
                <Text style={styles.prizeText}>
                  You won ${prizePerPlayer.toLocaleString()}
                </Text>
              </View>
            )}
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreValue}>{gameState.score}</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{correctAnswers}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {gameState.answeredQuestions.length - correctAnswers}
                </Text>
                <Text style={styles.statLabel}>Incorrect</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>
            
            <MockPrizePool />
            
            <MockPlayerList players={players} />
            
            <View style={styles.buttonsContainer}>
              <Button
                title="Play Again"
                onPress={handlePlayAgain}
                variant="primary"
                style={styles.playAgainButton}
              />
              
              <Button
                title="Back to Home"
                onPress={handleFinishGame}
                variant="outline"
                style={styles.homeButton}
              />
            </View>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Get current question
  const currentQuestion = questions[gameState.currentQuestionIndex];
  if (!currentQuestion) return null;
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.gameContainer}>
        {/* Game info */}
        <View style={styles.gameInfoContainer}>
          <View style={styles.questionInfo}>
            <Text style={styles.questionNumber}>
              Question {gameState.currentQuestionIndex + 1}/{questions.length}
            </Text>
            
            {gameState.status === 'playing' && (
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{gameState.timeRemaining}s</Text>
              </View>
            )}
          </View>
          
          <View style={styles.playersInfo}>
            <Users size={16} color={Colors.dark.text} />
            <Text style={styles.playersText}>
              {gameState.activePlayers} remaining
            </Text>
          </View>
        </View>
        
        {/* Eliminated message */}
        {gameState.isEliminated && (
          <View style={styles.eliminatedBanner}>
            <AlertTriangle size={16} color={Colors.dark.text} />
            <Text style={styles.eliminatedBannerText}>
              You've been eliminated but can still watch
            </Text>
          </View>
        )}
        
        {/* Question card */}
        <Animated.View 
          style={[
            styles.questionCardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <QuestionCard 
            question={{
              quiz_id: "1",
              question_id: currentQuestion.id,
              question_number: gameState.currentQuestionIndex + 1,
              text: currentQuestion.text,
              options: currentQuestion.options.map((text, id) => ({ id, text })),
              time_limit_sec: currentQuestion.timeLimit,
              point_value: currentQuestion.points,
              start_time: new Date().toISOString()
            }}
            questionNumber={gameState.currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />
        </Animated.View>
        
        {/* Answer options */}
        <View style={styles.answersContainer}>
          {currentQuestion.options.map((option, index) => (
            <AnswerOption
              key={index}
              text={option}
              index={index}
              selected={gameState.selectedAnswer === index}
              correct={
                gameState.status === 'reviewing'
                  ? index === currentQuestion.correctAnswer
                  : null
              }
              disabled={gameState.status !== 'playing' || gameState.selectedAnswer !== null || gameState.isEliminated}
              onSelect={() => handleSelectAnswer(index)}
            />
          ))}
        </View>
        
        {/* Prize pool info */}
        <View style={styles.prizePoolContainer}>
          <Text style={styles.prizePoolText}>
            Prize Pool: ${gameState.prizePool.toLocaleString()}
          </Text>
          <Text style={styles.prizePerPlayerText}>
            ${Math.floor(gameState.prizePool / gameState.activePlayers).toLocaleString()} per player
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getReadyText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 30,
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  gameContainer: {
    flex: 1,
    paddingTop: 20,
  },
  gameInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  questionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginRight: 10,
  },
  timerContainer: {
    backgroundColor: Colors.dark.timer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  playersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  playersText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  eliminatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.error,
    paddingVertical: 8,
    marginBottom: 15,
  },
  eliminatedBannerText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  questionCardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  answersContainer: {
    alignItems: 'center',
  },
  prizePoolContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
  },
  prizePoolText: {
    color: Colors.dark.warning,
    fontSize: 16,
    fontWeight: 'bold',
  },
  prizePerPlayerText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  resultsScrollContent: {
    flexGrow: 1,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  eliminatedMessage: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  eliminatedText: {
    color: Colors.dark.error,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  winnerMessage: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 214, 143, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  winnerText: {
    color: Colors.dark.success,
    fontSize: 18,
    fontWeight: 'bold',
  },
  prizeText: {
    color: Colors.dark.warning,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    width: '30%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 20,
  },
  playAgainButton: {
    marginBottom: 15,
  },
  homeButton: {
    borderColor: Colors.dark.text,
  },
});