import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { Quiz } from '@/types/quiz';

interface QuizCardProps {
  quiz: Quiz;
  onPress: (quiz: Quiz) => void;
}

export default function QuizCard({ quiz, onPress }: QuizCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = () => {
    switch (quiz.status) {
      case 'scheduled':
        return Colors.dark.warning;
      case 'in_progress':
        return Colors.dark.success;
      case 'completed':
        return Colors.dark.subtext;
      default:
        return Colors.dark.primary;
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (quiz.status) {
      case 'scheduled':
        return 'Upcoming';
      case 'in_progress':
        return 'Live Now';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(quiz)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.dark.primary, Colors.dark.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{quiz.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {quiz.description || "Join this exciting trivia game and test your knowledge!"}
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Calendar size={16} color={Colors.dark.text} />
            <Text style={styles.infoText}>{formatDate(quiz.scheduled_time)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Clock size={16} color={Colors.dark.text} />
            <Text style={styles.infoText}>{formatTime(quiz.scheduled_time)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Users size={16} color={Colors.dark.text} />
            <Text style={styles.infoText}>10 questions</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.text,
    opacity: 0.8,
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: Colors.dark.text,
    marginLeft: 4,
  },
});