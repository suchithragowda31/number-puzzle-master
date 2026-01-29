import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const GameHeader = ({ currentLevel, levelName, difficulty, onLevelSelect }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Number Match</Text>
      <View style={styles.levelRow}>
        <Text style={styles.levelText}>Level {currentLevel}/10 - {levelName}</Text>
        {/* <TouchableOpacity style={styles.selectButton} onPress={onLevelSelect}>
          <Text style={styles.selectButtonText}>Change Level</Text>
        </TouchableOpacity> */}
      </View>
      <Text style={styles.difficulty}>{difficulty}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#E6F0FF',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#595984ff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#595984ff',
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  levelText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#595984ff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  difficulty: {
    fontSize: 12,
    color: '#666',
  },
});

export default GameHeader;