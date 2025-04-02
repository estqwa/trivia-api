import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import QuizCard from '@/components/QuizCard';
import { useQuizStore } from '@/store/quiz-store';
import { useRouter } from 'expo-router';
import { Quiz } from '@/types/quiz';

export default function ScheduleScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const { scheduledQuizzes, fetchScheduledQuizzes, isLoading, error } = useQuizStore();
  
  // Fetch scheduled quizzes on mount
  useEffect(() => {
    fetchScheduledQuizzes();
  }, []);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScheduledQuizzes();
    setRefreshing(false);
  };
  
  // Handle quiz selection
  const handleQuizPress = (quiz: Quiz) => {
    if (quiz.status === 'in_progress') {
      router.push(`/quiz/${quiz.id}`);
    } else if (quiz.status === 'scheduled') {
      router.push(`/quiz/waiting-room?id=${quiz.id}`);
    } else if (quiz.status === 'completed') {
      router.push(`/quiz/results/${quiz.id}`);
    }
  };
  
  // Sort quizzes by scheduled time
  const sortedQuizzes = [...scheduledQuizzes].sort((a, b) => 
    new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
  );
  
  // Group quizzes by date
  const groupedQuizzes = sortedQuizzes.reduce((groups, quiz) => {
    const date = new Date(quiz.scheduled_time).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(quiz);
    return groups;
  }, {} as Record<string, Quiz[]>);
  
  // Convert grouped quizzes to array for FlatList
  const groupedQuizzesArray = Object.entries(groupedQuizzes).map(([date, quizzes]) => ({
    date,
    quizzes,
  }));
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Calendar size={30} color={Colors.dark.primary} />
        <Text style={styles.headerTitle}>Upcoming Quizzes</Text>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedQuizzesArray}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{item.date}</Text>
              {item.quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onPress={handleQuizPress}
                />
              ))}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isLoading}
              onRefresh={onRefresh}
              tintColor={Colors.dark.primary}
              colors={[Colors.dark.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No upcoming quizzes scheduled.
              </Text>
              <Text style={styles.emptySubtext}>
                Pull down to refresh.
              </Text>
            </View>
          }
          contentContainerStyle={
            groupedQuizzesArray.length === 0 ? styles.emptyList : styles.list
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginLeft: 10,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 20,
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.dark.error,
    textAlign: 'center',
  },
});