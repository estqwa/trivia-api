import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Users, CheckCircle, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import PlayerCard from '@/components/PlayerCard';
import { useQuizStore } from '@/store/quiz-store';
import { useAuthStore } from '@/store/auth-store';

export default function QuizResultsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const { quizResults, userResult, fetchQuizResults, fetchUserResult, isLoading } = useQuizStore();
  const { user } = useAuthStore();
  
  // Fetch quiz results and user result
  useEffect(() => {
    if (id) {
      fetchQuizResults(id as string);
      fetchUserResult(id as string);
    }
  }, [id]);
  
  // Handle play again
  const handlePlayAgain = () => {
    router.replace('/');
  };
  
  // Handle view leaderboard
  const handleViewLeaderboard = () => {
    router.push('/leaderboard');
  };
  
  // If no user result, show loading or error
  if (!userResult && isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!userResult && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Results not found</Text>
          <Button
            title="Back to Home"
            onPress={() => router.replace('/')}
            variant="primary"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[Colors.dark.primary, Colors.dark.background]}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>Quiz Results</Text>
          
          {userResult.is_winner ? (
            <View style={styles.winnerContainer}>
              <Trophy size={40} color={Colors.dark.warning} />
              <Text style={styles.winnerText}>Congratulations!</Text>
              <Text style={styles.winnerSubtext}>You made it to the end!</Text>
              <Text style={styles.prizeText}>
                You won ${Math.floor(userResult.prize_fund / 10)}
              </Text>
            </View>
          ) : (
            <View style={styles.eliminatedContainer}>
              <Text style={styles.eliminatedText}>You were eliminated</Text>
              <Text style={styles.eliminatedSubtext}>
                Better luck next time!
              </Text>
            </View>
          )}
        </LinearGradient>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userResult.score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userResult.correct_answers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round((userResult.correct_answers / userResult.total_questions) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
        
        <View style={styles.rankContainer}>
          <Text style={styles.rankLabel}>Your Rank</Text>
          <Text style={styles.rankValue}>{userResult.rank}</Text>
          <Text style={styles.rankSubtext}>
            out of {quizResults.length} players
          </Text>
        </View>
        
        <View style={styles.topPlayersContainer}>
          <Text style={styles.topPlayersTitle}>Top Players</Text>
          
          {quizResults.slice(0, 5).map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              rank={index + 1}
              isCurrentUser={player.user_id === user?.id}
            />
          ))}
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Play Again"
            onPress={handlePlayAgain}
            variant="primary"
            style={styles.playAgainButton}
          />
          
          <Button
            title="View Leaderboard"
            onPress={handleViewLeaderboard}
            variant="outline"
            style={styles.leaderboardButton}
          />
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
    marginBottom: 20,
  },
  winnerContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 20,
    width: '90%',
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.warning,
    marginTop: 10,
  },
  winnerSubtext: {
    fontSize: 16,
    color: Colors.dark.text,
    marginTop: 5,
  },
  prizeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 10,
  },
  eliminatedContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 16,
    padding: 20,
    width: '90%',
  },
  eliminatedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.error,
  },
  eliminatedSubtext: {
    fontSize: 16,
    color: Colors.dark.text,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -20,
    marginHorizontal: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginTop: 5,
  },
  rankContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  rankLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  rankValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  rankSubtext: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  topPlayersContainer: {
    marginHorizontal: 20,
  },
  topPlayersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 10,
  },
  buttonsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  playAgainButton: {
    marginBottom: 10,
  },
  leaderboardButton: {
    borderColor: Colors.dark.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.dark.text,
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
    marginBottom: 20,
  },
  errorButton: {
    width: '80%',
  },
});