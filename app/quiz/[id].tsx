import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Animated, 
  Dimensions,
  BackHandler,
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useQuizStore } from '@/store/quiz-store';
import { useWebSocketStore } from '@/store/websocket-store';
import QuestionCard from '@/components/QuestionCard';
import AnswerOption from '@/components/AnswerOption';
import CountdownTimer from '@/components/CountdownTimer';
import Button from '@/components/Button';
import PlayerList from '@/components/PlayerList';
import PrizePool from '@/components/PrizePool';

const { width, height } = Dimensions.get('window');

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const {
    activeQuiz,
    currentQuestion,
    questionResults,
    selectedAnswer,
    isAnswerSubmitted,
    isEliminated,
    selectAnswer,
    submitAnswer,
    resetQuizState,
  } = useQuizStore();
  
  const { isConnected, connect } = useWebSocketStore();
  
  const [countdown, setCountdown] = useState(3);
  const [showResults, setShowResults] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;
  
  // Connect to WebSocket if not connected
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
    
    // Reset quiz state when leaving
    return () => {
      resetQuizState();
    };
  }, []);
  
  // Handle back button
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Leave Quiz',
        'Are you sure you want to leave the quiz? You will be eliminated.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Leave', 
            style: 'destructive',
            onPress: () => {
              resetQuizState();
              router.back();
            }
          }
        ]
      );
      return true;
    };
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    
    return () => backHandler.remove();
  }, []);
  
  // Animations for question and answers
  useEffect(() => {
    if (currentQuestion) {
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
      
      // Haptic feedback for new question
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(width);
    }
  }, [currentQuestion]);
  
  // Show results when question ends
  useEffect(() => {
    if (questionResults) {
      setShowResults(true);
      
      // Hide results after 5 seconds
      const timer = setTimeout(() => {
        setShowResults(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [questionResults]);
  
  const handleSelectAnswer = async (index: number) => {
    if (!currentQuestion || isAnswerSubmitted || isEliminated) return;
    
    selectAnswer(index);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Submit answer
    await submitAnswer(currentQuestion.quiz_id, currentQuestion.question_id);
  };
  
  // Render countdown screen
  if (countdown > 0) {
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
  
  // If no current question, show waiting screen
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>Waiting for the next question...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.quizContainer}>
        {/* Quiz info */}
        <View style={styles.quizInfoContainer}>
          <View style={styles.questionInfo}>
            <Text style={styles.questionNumber}>
              Question {currentQuestion.question_number}/{activeQuiz?.question_count || 10}
            </Text>
            
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{currentQuestion.time_limit_sec}s</Text>
            </View>
          </View>
          
          <View style={styles.playersInfo}>
            <Users size={16} color={Colors.dark.text} />
            <Text style={styles.playersText}>
              1000 remaining
            </Text>
          </View>
        </View>
        
        {/* Eliminated message */}
        {isEliminated && (
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
            question={currentQuestion} 
            questionNumber={currentQuestion.question_number}
            totalQuestions={activeQuiz?.question_count || 10}
          />
        </Animated.View>
        
        {/* Timer */}
        <View style={styles.timerWrapper}>
          <CountdownTimer 
            seconds={currentQuestion.time_limit_sec} 
            size={80}
            onComplete={() => {
              // Time's up - treat as wrong answer if not answered
              if (!isAnswerSubmitted && !isEliminated) {
                handleSelectAnswer(-1); // Invalid answer index
              }
            }}
          />
        </View>
        
        {/* Answer options */}
        <View style={styles.answersContainer}>
          {currentQuestion.options.map((option, index) => (
            <AnswerOption
              key={index}
              text={option.text}
              index={index}
              selected={selectedAnswer === index}
              correct={
                showResults
                  ? index === questionResults?.correct_option
                  : null
              }
              disabled={isAnswerSubmitted || isEliminated}
              onSelect={() => handleSelectAnswer(index)}
            />
          ))}
        </View>
        
        {/* Prize pool info */}
        <View style={styles.prizePoolContainer}>
          <Text style={styles.prizePoolText}>
            Prize Pool: $10,000
          </Text>
          <Text style={styles.prizePerPlayerText}>
            $100 per player
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
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  waitingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  quizContainer: {
    flex: 1,
    paddingTop: 20,
  },
  quizInfoContainer: {
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
  timerWrapper: {
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
});