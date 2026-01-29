import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { formatTime } from '../../utils/gameLogic';

const StartScreen = ({ levelConfig, onStart }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Level {levelConfig.level}</Text>
      <Text style={styles.subtitle}>{levelConfig.name}</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.stat}>Target: {levelConfig.targetMatches} matches</Text>
        <Text style={styles.stat}>Time: {formatTime(levelConfig.timeLimit)}</Text>
        <Text style={styles.stat}>Add Rows: {levelConfig.maxAddRows}</Text>
        <Text style={styles.stat}>Hints: {levelConfig.hintsAllowed}</Text>
      </View>

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>HOW TO PLAY:</Text>
        <Text style={styles.ruleText}>• Match same numbers or pairs that sum to 10</Text>
        <Text style={styles.ruleText}>• Connect in straight lines or with one turn</Text>
        <Text style={styles.ruleText}>• Diagonal connections allowed</Text>
        <Text style={styles.ruleText}>(for example:-((5,5),(1,1),(2,2)...)or((6,4),(8,2),(7,3),(9,1)..)</Text>
        <Text style={styles.ruleText}>• For every correct match earn 10 points</Text>
    
      </View>

      <TouchableOpacity style={styles.startButton} onPress={onStart}>
        <Text style={styles.startButtonText}>START</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#E6F0FF',
    borderRadius: 15,
    margin: 10,
    borderWidth: 2,
    borderColor: '#595984ff',
  },
  title: {
    fontSize: 32,
    color: '#595984ff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  stat: {
    fontSize: 14,
    color: '#666',
    marginVertical: 3,
  },
  rulesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#595984ff',
  },
  rulesTitle: {
    fontSize: 14,
    color: '#595984ff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ruleText: {
    fontSize: 13,
    color: '#333',
    marginVertical: 2,
  },
  startButton: {
    backgroundColor: '#595984ff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StartScreen;