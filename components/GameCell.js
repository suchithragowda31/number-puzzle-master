import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, Animated, View, StyleSheet } from 'react-native';

const GameCell = ({ number, row, col, isSelected, isHinted, isMatched, onPress, animationType }) => {
  const animatedValue = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (isMatched) return;
    Animated.sequence([
      Animated.timing(animatedValue, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress(row, col);
  };

  useEffect(() => {
    if (animationType === 'shake') {
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 8, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -8, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [animationType]);

  if (number === null) {
    return <View style={styles.emptyCell} />;
  }

  return (
    <Animated.View style={[
      styles.cell,
      isSelected && styles.selectedCell,
      isHinted && styles.hintedCell,
      isMatched && styles.matchedCell,
      { transform: [{ scale: animatedValue }, { translateX: shakeAnimation }] }
    ]}>
      <TouchableOpacity onPress={handlePress} style={styles.cellTouchable} disabled={isMatched}>
        <Text style={[styles.cellText, isMatched && styles.matchedText]}>{number}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 45,
    backgroundColor: '#FFFFFF',
    margin: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#595984ff',
  },
  cellTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCell: {
    backgroundColor: '#CCE0FF',
    borderColor: '#595984ff',
    borderWidth: 3,
  },
  hintedCell: {
    backgroundColor: '#FFFF99',
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  matchedCell: {
    backgroundColor: '#E6E6E6',
    borderColor: '#CCCCCC',
    opacity: 0.5,
  },
  cellText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#595984ff',
  },
  matchedText: {
    color: '#999999',
  },
  emptyCell: {
    width: 40,
    height: 45,
    margin: 2,
  },
});

export default GameCell;