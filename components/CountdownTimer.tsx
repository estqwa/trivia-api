import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';

interface CountdownTimerProps {
  seconds: number;
  size?: number;
  onComplete?: () => void;
}

export default function CountdownTimer({ 
  seconds, 
  size = 120, 
  onComplete 
}: CountdownTimerProps) {
  const animation = useRef(new Animated.Value(seconds)).current;
  const countRef = useRef(seconds);
  
  useEffect(() => {
    countRef.current = seconds;
    animation.setValue(seconds);
    
    const interval = setInterval(() => {
      countRef.current -= 1;
      if (countRef.current <= 0) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 1000);
    
    Animated.timing(animation, {
      toValue: 0,
      duration: seconds * 1000,
      useNativeDriver: false
    }).start();
    
    return () => clearInterval(interval);
  }, [seconds]);
  
  const animatedColor = animation.interpolate({
    inputRange: [0, seconds / 2, seconds],
    outputRange: [Colors.dark.error, Colors.dark.warning, Colors.dark.success]
  });
  
  const strokeDasharray = size * Math.PI;
  const strokeDashoffset = animation.interpolate({
    inputRange: [0, seconds],
    outputRange: [strokeDasharray, 0]
  });
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.circle, { borderColor: animatedColor }]} />
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.text, { color: animatedColor }]}>
          {Math.ceil(countRef.current)}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 6,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
  }
});