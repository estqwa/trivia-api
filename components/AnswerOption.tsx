import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions 
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AnswerOptionProps {
  text: string;
  index: number;
  selected: boolean;
  correct: boolean | null;
  disabled: boolean;
  onSelect: () => void;
}

const { width } = Dimensions.get('window');

export default function AnswerOption({ 
  text, 
  index, 
  selected, 
  correct, 
  disabled, 
  onSelect 
}: AnswerOptionProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Letters for answer options
  const letters = ['A', 'B', 'C', 'D'];
  
  useEffect(() => {
    // Animate in with slight delay based on index
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.spring(opacity, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
      })
    ]).start();
    
    // Pulse animation when selected
    if (selected) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [selected]);
  
  // Determine background color based on state
  let backgroundColor = 'rgba(255, 255, 255, 0.1)';
  let borderColor = 'rgba(255, 255, 255, 0.2)';
  
  if (selected && correct === true) {
    backgroundColor = Colors.dark.success;
    borderColor = Colors.dark.success;
  } else if (selected && correct === false) {
    backgroundColor = Colors.dark.error;
    borderColor = Colors.dark.error;
  } else if (correct === true && !selected) {
    backgroundColor = Colors.dark.success;
    borderColor = Colors.dark.success;
  } else if (selected) {
    backgroundColor = 'rgba(255, 255, 255, 0.2)';
    borderColor = Colors.dark.primary;
  }
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity, 
          transform: [{ scale }],
          backgroundColor,
          borderColor
        }
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onSelect}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.letterContainer}>
            <Text style={styles.letter}>{letters[index]}</Text>
          </View>
          <Text style={styles.text}>{text}</Text>
        </View>
        
        {selected && correct === true && (
          <View style={styles.icon}>
            <Check color={Colors.dark.text} size={20} />
          </View>
        )}
        
        {selected && correct === false && (
          <View style={styles.icon}>
            <X color={Colors.dark.text} size={20} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  letter: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: Colors.dark.text,
    fontSize: 16,
    flex: 1,
  },
  icon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -10,
  },
});