import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, Trophy, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface GameStatsProps {
  score: number;
  lives: number;
  streak: number;
}

export default function GameStats({ score, lives, streak }: GameStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statContainer}>
        <Trophy size={20} color={Colors.dark.warning} />
        <Text style={styles.statText}>{score}</Text>
      </View>
      
      <View style={styles.statContainer}>
        <Heart 
          size={20} 
          color={lives > 0 ? Colors.dark.error : Colors.dark.subtext} 
          fill={lives > 0 ? Colors.dark.error : 'transparent'} 
        />
        <Text style={styles.statText}>{lives}</Text>
      </View>
      
      <View style={styles.statContainer}>
        <Zap 
          size={20} 
          color={streak > 0 ? Colors.dark.warning : Colors.dark.subtext} 
          fill={streak > 0 ? Colors.dark.warning : 'transparent'} 
        />
        <Text style={styles.statText}>{streak}x</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    marginBottom: 20,
    width: '90%',
    alignSelf: 'center',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  statText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});