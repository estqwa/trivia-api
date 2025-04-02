import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Calendar, Clock, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useQuizStore } from '@/store/quiz-store';
import { useAuthStore } from '@/store/auth-store';
import { useWebSocketStore } from '@/store/websocket-store';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const { user, isAuthenticated } = useAuthStore();
  const { activeQuiz, scheduledQuizzes, fetchActiveQuiz, fetchScheduledQuizzes } = useQuizStore();
  const { connect } = useWebSocketStore();
  
  // Fetch active quiz and scheduled quizzes on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchActiveQuiz();
      fetchScheduledQuizzes();
      connect();
    }
  }, [isAuthenticated]);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchActiveQuiz(),
      fetchScheduledQuizzes()
    ]);
    setRefreshing(false);
  };
  
  // Handle join active quiz
  const handleJoinActiveQuiz = () => {
    if (activeQuiz) {
      router.push(`/quiz/${activeQuiz.id}`);
    }
  };
  
  // Handle view scheduled quiz
  const handleViewScheduledQuiz = (quizId: string) => {
    router.push(`/quiz/waiting-room?id=${quizId}`);
  };
  
  // Get next scheduled quiz
  const getNextScheduledQuiz = () => {
    if (scheduledQuizzes.length === 0) return null;
    
    return scheduledQuizzes.sort((a, b) => 
      new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
    )[0];
  };
  
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
  
  // Calculate time until quiz
  const getTimeUntilQuiz = (dateString: string) => {
    const now = new Date();
    const quizTime = new Date(dateString);
    const diffMs = quizTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Starting now';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    } else {
      return `${diffMins}m`;
    }
  };
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authPromptTitle}>Welcome to HQ Trivia</Text>
          <Text style={styles.authPromptText}>
            Sign in or create an account to join live trivia games and win real prizes!
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/auth')}
            variant="primary"
            style={styles.authButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const nextQuiz = getNextScheduledQuiz();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
            colors={[Colors.dark.primary]}
          />
        }
      >
        {/* Header with logo */}
        <View style={styles.header}>
          <Text style={styles.logoText}>HQ</Text>
          <Text style={styles.logoSubtext}>TRIVIA</Text>
        </View>
        
        {/* Welcome section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.username || 'Player'}!
          </Text>
        </View>
        
        {/* Active Quiz Card */}
        {activeQuiz && (
          <LinearGradient
            colors={[Colors.dark.primary, Colors.dark.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeQuizCard}
          >
            <View style={styles.liveIndicator}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.liveIndicatorText}>LIVE NOW</Text>
            </View>
            
            <Text style={styles.activeQuizTitle}>{activeQuiz.title}</Text>
            <Text style={styles.activeQuizDescription}>
              {activeQuiz.description || "A live trivia game is in progress. Join now to participate!"}
            </Text>
            
            <Button 
              title="Join Now" 
              onPress={handleJoinActiveQuiz}
              variant="primary"
              icon={<Play size={20} color={Colors.dark.text} style={{ marginRight: 8 }} />}
              style={styles.joinButton}
            />
          </LinearGradient>
        )}
        
        {/* Next Quiz Card */}
        {!activeQuiz && nextQuiz && (
          <View style={styles.nextQuizCard}>
            <Text style={styles.nextQuizLabel}>NEXT QUIZ</Text>
            <Text style={styles.nextQuizTitle}>{nextQuiz.title}</Text>
            
            <View style={styles.nextQuizInfo}>
              <View style={styles.nextQuizInfoItem}>
                <Calendar size={16} color={Colors.dark.text} />
                <Text style={styles.nextQuizInfoText}>
                  {formatDate(nextQuiz.scheduled_time)}
                </Text>
              </View>
              
              <View style={styles.nextQuizInfoItem}>
                <Clock size={16} color={Colors.dark.text} />
                <Text style={styles.nextQuizInfoText}>
                  {formatTime(nextQuiz.scheduled_time)}
                </Text>
              </View>
            </View>
            
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>Starting in</Text>
              <Text style={styles.countdownValue}>
                {getTimeUntilQuiz(nextQuiz.scheduled_time)}
              </Text>
            </View>
            
            <Button 
              title="Enter Waiting Room" 
              onPress={() => handleViewScheduledQuiz(nextQuiz.id)}
              variant="outline"
              style={styles.waitingRoomButton}
            />
          </View>
        )}
        
        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <DollarSign size={24} color={Colors.dark.warning} />
            <Text style={styles.featureTitle}>Win Real Prizes</Text>
            <Text style={styles.featureDescription}>
              Stay in the game until the end to win your share of the prize pool
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Play size={24} color={Colors.dark.secondary} />
            <Text style={styles.featureTitle}>Live Trivia</Text>
            <Text style={styles.featureDescription}>
              Answer questions in real-time with thousands of other players
            </Text>
          </View>
        </View>
        
        {/* Game Rules */}
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>How to Play</Text>
          
          <View style={styles.ruleItem}>
            <View style={styles.ruleNumber}>
              <Text style={styles.ruleNumberText}>1</Text>
            </View>
            <Text style={styles.ruleText}>
              Answer trivia questions correctly to stay in the game
            </Text>
          </View>
          
          <View style={styles.ruleItem}>
            <View style={styles.ruleNumber}>
              <Text style={styles.ruleNumberText}>2</Text>
            </View>
            <Text style={styles.ruleText}>
              Answer within the time limit or you're eliminated
            </Text>
          </View>
          
          <View style={styles.ruleItem}>
            <View style={styles.ruleNumber}>
              <Text style={styles.ruleNumberText}>3</Text>
            </View>
            <Text style={styles.ruleText}>
              One wrong answer and you're out, but can still watch
            </Text>
          </View>
          
          <View style={styles.ruleItem}>
            <View style={styles.ruleNumber}>
              <Text style={styles.ruleNumberText}>4</Text>
            </View>
            <Text style={styles.ruleText}>
              Prize pool is split equally among all remaining players
            </Text>
          </View>
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
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  logoSubtext: {
    fontSize: 18,
    color: Colors.dark.text,
    letterSpacing: 4,
    marginTop: -10,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  activeQuizCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.error,
    marginRight: 6,
  },
  liveIndicatorText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeQuizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  activeQuizDescription: {
    fontSize: 14,
    color: Colors.dark.text,
    opacity: 0.8,
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  nextQuizCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  nextQuizLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    marginBottom: 8,
  },
  nextQuizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  nextQuizInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  nextQuizInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  nextQuizInfoText: {
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: 6,
  },
  countdownContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.warning,
  },
  waitingRoomButton: {
    borderColor: Colors.dark.text,
  },
  featuresContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 10,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  rulesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 15,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ruleNumberText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  ruleText: {
    color: Colors.dark.text,
    fontSize: 14,
    flex: 1,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  authPromptText: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    width: '80%',
  },
});