import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { formatTime } from '../utils/gameLogic';

const GameStats = ({ matches, targetMatches, timeLeft, score }) => {
  const progressPercent = (matches / targetMatches) * 100;

  return (
    <>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Matches</Text>
          <Text style={styles.statValue}>{matches}/{targetMatches}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={[styles.statValue, timeLeft < 30 && styles.urgentTime]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.floor(progressPercent)}%</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E6F0FF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#595984ff',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: '#595984ff',
    fontWeight: 'bold',
  },
  urgentTime: {
    color: '#FF0000',
  },
  progressContainer: {
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#E6F0FF',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop:8,
    borderWidth: 1,
    borderColor: '#595984ff',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#595984ff',
  },
  progressText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});

export default GameStats;