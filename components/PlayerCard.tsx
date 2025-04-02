import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '@/constants/colors';
import { QuizResult } from '@/types/quiz';

interface PlayerCardProps {
  player: QuizResult;
  rank: number;
  isCurrentUser?: boolean;
}

export default function PlayerCard({ player, rank, isCurrentUser = false }: PlayerCardProps) {
  return (
    <View style={[
      styles.container, 
      isCurrentUser && styles.currentUserContainer
    ]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      
      <Image 
        source={{ uri: player.profile_picture || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop' }} 
        style={styles.avatar} 
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{player.username}</Text>
        <Text style={styles.statsText}>
          {player.correct_answers}/{player.total_questions} correct
        </Text>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{player.score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
  },
  currentUserContainer: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsText: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  scoreContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});