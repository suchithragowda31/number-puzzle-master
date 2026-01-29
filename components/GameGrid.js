import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import GameCell from './GameCell';

const GameGrid = ({ gridData, selectedCell, hintedCells, matchedCells, animatingCells, onCellPress, scrollViewRef }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {gridData.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((number, colIndex) => (
                <GameCell
                  key={`${rowIndex}-${colIndex}`}
                  number={number}
                  row={rowIndex}
                  col={colIndex}
                  isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                  isHinted={hintedCells.has(`${rowIndex}-${colIndex}`)}
                  isMatched={matchedCells.has(`${rowIndex}-${colIndex}`)}
                  onPress={onCellPress}
                  animationType={animatingCells.has(`${rowIndex}-${colIndex}`) ? 'shake' : null}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FF',
    borderRadius: 15,
    padding: 15,
    margin: 10,
    borderWidth: 2,
    borderColor: '#595984ff',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  grid: {
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
});

export default GameGrid;