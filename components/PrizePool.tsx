import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface PrizePoolProps {
  prizePool?: number;
  activePlayers?: number;
}

export default function PrizePool({ 
  prizePool = 10000, 
  activePlayers = 100 
}: PrizePoolProps) {
  const prizePerPlayer = activePlayers > 0 
    ? Math.floor(prizePool / activePlayers) 
    : 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DollarSign size={20} color={Colors.dark.warning} />
        <Text style={styles.headerText}>Prize Pool</Text>
      </View>
      
      <View style={styles.prizeInfo}>
        <Text style={styles.totalPrize}>${prizePool.toLocaleString()}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.splitInfo}>
          <Text style={styles.splitText}>
            Split between {activePlayers} player{activePlayers !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.perPlayerText}>
            ${prizePerPlayer.toLocaleString()} per player
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  prizeInfo: {
    alignItems: 'center',
  },
  totalPrize: {
    color: Colors.dark.warning,
    fontSize: 32,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    marginVertical: 12,
  },
  splitInfo: {
    alignItems: 'center',
  },
  splitText: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  perPlayerText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});