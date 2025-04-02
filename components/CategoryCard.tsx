import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Category } from '@/types/game';
import { Brain, FlaskConical, Landmark, Globe, Film, Trophy, Cpu, Palette } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface CategoryCardProps {
  category: Category;
  onSelect: (category: Category) => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  // Map category icons
  const getIcon = () => {
    switch (category.icon) {
      case 'brain':
        return <Brain size={30} color={Colors.dark.text} />;
      case 'flask-conical':
        return <FlaskConical size={30} color={Colors.dark.text} />;
      case 'landmark':
        return <Landmark size={30} color={Colors.dark.text} />;
      case 'globe':
        return <Globe size={30} color={Colors.dark.text} />;
      case 'film':
        return <Film size={30} color={Colors.dark.text} />;
      case 'trophy':
        return <Trophy size={30} color={Colors.dark.text} />;
      case 'cpu':
        return <Cpu size={30} color={Colors.dark.text} />;
      case 'palette':
        return <Palette size={30} color={Colors.dark.text} />;
      default:
        return <Brain size={30} color={Colors.dark.text} />;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: category.color }]}
      onPress={() => onSelect(category)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <Text style={styles.name}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: cardWidth,
    borderRadius: 16,
    padding: 16,
    margin: 10,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});