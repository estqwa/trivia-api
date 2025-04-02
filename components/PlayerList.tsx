import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { User, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Player } from '@/types/game';

interface PlayerListProps {
  players: Player[];
  showHeader?: boolean;
  compact?: boolean;
}

export default function PlayerList({ 
  players = [], // Default value to avoid errors
  showHeader = true, 
  compact = false 
}: PlayerListProps) {
  const activePlayers = players.filter(player => player.isActive);
  const eliminatedPlayers = players.filter(player => !player.isActive);
  
  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={[styles.playerItem, compact && styles.playerItemCompact]}>
      <View style={[
        styles.statusIndicator, 
        item.isActive ? styles.activeIndicator : styles.eliminatedIndicator
      ]} />
      <Text style={styles.playerName} numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Users size={18} color={Colors.dark.text} />
          <Text style={styles.headerText}>
            Players: {activePlayers.length} active / {players.length} total
          </Text>
        </View>
      )}
      
      <View style={styles.listsContainer}>
        <View style={styles.listColumn}>
          <Text style={styles.listTitle}>Active ({activePlayers.length})</Text>
          {activePlayers.length > 0 ? (
            <FlatList
              data={activePlayers}
              renderItem={renderPlayer}
              keyExtractor={(item) => item.id}
              scrollEnabled={!compact}
              style={compact ? styles.compactList : styles.list}
            />
          ) : (
            <Text style={styles.emptyText}>No active players</Text>
          )}
        </View>
        
        <View style={styles.listColumn}>
          <Text style={styles.listTitle}>Eliminated ({eliminatedPlayers.length})</Text>
          {eliminatedPlayers.length > 0 ? (
            <FlatList
              data={eliminatedPlayers}
              renderItem={renderPlayer}
              keyExtractor={(item) => item.id}
              scrollEnabled={!compact}
              style={compact ? styles.compactList : styles.list}
            />
          ) : (
            <Text style={styles.emptyText}>No eliminated players</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listsContainer: {
    flexDirection: 'row',
  },
  listColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  listTitle: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  list: {
    maxHeight: 150,
  },
  compactList: {
    maxHeight: 80,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  playerItemCompact: {
    paddingVertical: 3,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeIndicator: {
    backgroundColor: Colors.dark.success,
  },
  eliminatedIndicator: {
    backgroundColor: Colors.dark.error,
  },
  playerName: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  emptyText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
});