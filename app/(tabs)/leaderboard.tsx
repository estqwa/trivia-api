import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Trophy } from 'lucide-react-native';
import Colors from '@/constants/colors';
import PlayerCard from '@/components/PlayerCard';
import { useQuizStore } from '@/store/quiz-store';
import { useAuthStore } from '@/store/auth-store';

export default function LeaderboardScreen() {
  const [timeFilter, setTimeFilter] = useState<'all' | 'weekly' | 'daily'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { quizResults, fetchQuizResults, isLoading, error } = useQuizStore();
  const { user } = useAuthStore();
  
  // Fetch quiz results on mount
  useEffect(() => {
    fetchQuizResults('leaderboard');
  }, []);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuizResults('leaderboard');
    setRefreshing(false);
  };
  
  // Find current user rank
  const currentUserRank = quizResults.findIndex(p => p.user_id === user?.id) + 1;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Trophy size={30} color={Colors.dark.warning} />
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === 'all' && styles.activeFilterButton
          ]}
          onPress={() => setTimeFilter('all')}
        >
          <Text style={[
            styles.filterText,
            timeFilter === 'all' && styles.activeFilterText
          ]}>All Time</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === 'weekly' && styles.activeFilterButton
          ]}
          onPress={() => setTimeFilter('weekly')}
        >
          <Text style={[
            styles.filterText,
            timeFilter === 'weekly' && styles.activeFilterText
          ]}>Weekly</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === 'daily' && styles.activeFilterButton
          ]}
          onPress={() => setTimeFilter('daily')}
        >
          <Text style={[
            styles.filterText,
            timeFilter === 'daily' && styles.activeFilterText
          ]}>Daily</Text>
        </TouchableOpacity>
      </View>
      
      {quizResults.length > 0 && (
        <View style={styles.topThreeContainer}>
          {quizResults.slice(0, 3).map((player, index) => (
            <View key={player.id} style={styles.topPlayerContainer}>
              <View style={[
                styles.crownContainer,
                index === 0 ? styles.firstPlace : 
                index === 1 ? styles.secondPlace : styles.thirdPlace
              ]}>
                <Text style={styles.crownText}>{index + 1}</Text>
              </View>
              <Text style={styles.topPlayerName} numberOfLines={1}>
                {player.username}
              </Text>
              <Text style={styles.topPlayerScore}>{player.score}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.listContainer}>
        <Text style={styles.rankingsTitle}>Rankings</Text>
        <FlatList
          data={quizResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <PlayerCard 
              player={item} 
              rank={index + 1} 
              isCurrentUser={item.user_id === user?.id}
            />
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
                {error || "No leaderboard data available."}
              </Text>
              <Text style={styles.emptySubtext}>
                Pull down to refresh.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            quizResults.length === 0 ? styles.emptyList : styles.listContent
          }
        />
      </View>
      
      {currentUserRank > 10 && user && (
        <View style={styles.yourRankContainer}>
          <Text style={styles.yourRankText}>Your Rank: {currentUserRank}</Text>
        </View>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeFilterButton: {
    backgroundColor: Colors.dark.primary,
  },
  filterText: {
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.dark.text,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  topPlayerContainer: {
    alignItems: 'center',
    width: '30%',
  },
  crownContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  firstPlace: {
    backgroundColor: Colors.dark.warning,
  },
  secondPlace: {
    backgroundColor: '#C0C0C0', // Silver
  },
  thirdPlace: {
    backgroundColor: '#CD7F32', // Bronze
  },
  crownText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    fontSize: 18,
  },
  topPlayerName: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
  },
  topPlayerScore: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  rankingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginLeft: 20,
    marginBottom: 10,
  },
  listContent: {
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
    fontSize: 16,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
  },
  yourRankContainer: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.primary,
  },
  yourRankText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});