import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { WsQuestionStartMessage } from '@/types/quiz';

interface QuestionCardProps {
  question: WsQuestionStartMessage;
  questionNumber: number;
  totalQuestions: number;
}

const { width } = Dimensions.get('window');

export default function QuestionCard({ 
  question, 
  questionNumber, 
  totalQuestions 
}: QuestionCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(108, 92, 231, 0.8)', 'rgba(0, 206, 206, 0.8)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.questionCount}>
            Question {questionNumber} of {totalQuestions}
          </Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>
              {question.point_value} pts
            </Text>
          </View>
        </View>
        
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.text}</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.timerText}>
            {question.time_limit_sec}s time limit
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gradient: {
    padding: 20,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionCount: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  pointsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20,
  },
  questionText: {
    color: Colors.dark.text,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 30,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  timerText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
});