import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Clock, Calendar, DollarSign, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useQuizStore } from '@/store/quiz-store';
import { useWebSocketStore } from '@/store/websocket-store';
import PlayerList from '@/components/PlayerList';

export default function WaitingRoomScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isReady, setIsReady] = useState(false);
  
  const { scheduledQuizzes, markAsReady } = useQuizStore();
  const { connect, isConnected } = useWebSocketStore();
  
  // Find the quiz by id
  const quiz = scheduledQuizzes.find(q => q.id === id);
  
  // Connect to WebSocket
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, []);
  
  // Update time remaining
  useEffect(() => {
    if (!quiz) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const quizTime = new Date(quiz.scheduled_time);
      const diffMs = quizTime.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        clearInterval(interval);
        setTimeRemaining('Starting now');
        
        // Navigate to quiz screen
        router.replace(`/quiz/${id}`);
        return;
      }
      
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${diffMins}:${diffSecs.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [quiz]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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
  
  // Handle ready button
  const handleReady = async () => {
    if (!quiz) return;
    
    const success = await markAsReady(quiz.id);
    if (success) {
      setIsReady(true);
      Alert.alert(
        'Ready!',
        'You are now ready for the quiz. The quiz will start automatically when scheduled.'
      );
    }
  };
  
  // Mock players for demo
  const mockPlayers = [
    { id: '1', name: 'Alex Johnson', isActive: true, isOnline: true },
    { id: '2', name: 'Samantha Lee', isActive: true, isOnline: true },
    { id: '3', name: 'Michael Chen', isActive: true, isOnline: true },
    { id: '4', name: 'Jessica Kim', isActive: true, isOnline: true },
    { id: '5', name: 'David Wilson', isActive: true, isOnline: true },
    { id: '6', name: 'Emily Davis', isActive: true, isOnline: true },
    { id: '7', name: 'James Taylor', isActive: true, isOnline: true },
    { id: '8', name: 'Olivia Martinez', isActive: true, isOnline: true },
  ];
  
  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Quiz not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[Colors.dark.primary, 'transparent']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.title}>{quiz.title}</Text>
          
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Starting in</Text>
            <Text style={styles.countdownValue}>{timeRemaining}</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Calendar size={20} color={Colors.dark.primary} />
            <Text style={styles.infoText}>
              {formatDate(quiz.scheduled_time)}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Clock size={20} color={Colors.dark.primary} />
            <Text style={styles.infoText}>
              {formatTime(quiz.scheduled_time)}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <DollarSign size={20} color={Colors.dark.primary} />
            <Text style={styles.infoText}>
              $10,000 Prize Pool
            </Text>
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this Quiz</Text>
          <Text style={styles.descriptionText}>
            {quiz.description || "Join this exciting trivia game and test your knowledge! Answer questions correctly to stay in the game and win your share of the prize pool."}
          </Text>
        </View>
        
        <View style={styles.readyContainer}>
          <Text style={styles.readyTitle}>Ready to Play?</Text>
          <Text style={styles.readyText}>
            Click the button below to mark yourself as ready. The quiz will start automatically at the scheduled time.
          </Text>
          
          <Button
            title={isReady ? "You're Ready!" : "I'm Ready"}
            onPress={handleReady}
            variant={isReady ? "secondary" : "primary"}
            disabled={isReady}
            icon={isReady ? <CheckCircle size={20} color={Colors.dark.text} style={{ marginRight: 8 }} /> : undefined}
            style={styles.readyButton}
          />
        </View>
        
        <View style={styles.playersContainer}>
          <Text style={styles.playersTitle}>Players in Waiting Room</Text>
          <Text style={styles.playersCount}>
            {mockPlayers.length} players ready
          </Text>
          
          <PlayerList players={mockPlayers} showHeader={false} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  countdownContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '80%',
  },
  countdownLabel: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  countdownValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: -20,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    color: Colors.dark.text,
    fontSize: 12,
    marginTop: 5,
  },
  descriptionContainer: {
    padding: 20,
    marginTop: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    lineHeight: 22,
  },
  readyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  readyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 10,
  },
  readyText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 20,
  },
  readyButton: {
    width: '100%',
  },
  playersContainer: {
    padding: 20,
    marginTop: 20,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 5,
  },
  playersCount: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.dark.error,
    textAlign: 'center',
  },
});