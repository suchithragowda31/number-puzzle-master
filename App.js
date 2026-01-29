import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, StatusBar, Platform, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// SERVICES
import { LevelManager, NumberMatchStrategy } from './services/LevelSystem';

// UTILS
import { hasValidPath, findPossibleMatches, canMatch, addNewRow } from './utils/gameLogic';

// COMPONENTS
import GameHeader from './components/GameHeader';
import GameStats from './components/GameStats';
import GameControls from './components/GameControls';
import GameGrid from './components/GameGrid';
import StartScreen from './components/screens/StartScreen';

const levelManager = new LevelManager(new NumberMatchStrategy());

export default function App() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [matchedCells, setMatchedCells] = useState(new Set());
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [addedRows, setAddedRows] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [animatingCells, setAnimatingCells] = useState(new Set());
  const [hintedCells, setHintedCells] = useState(new Set());
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  
  const scrollViewRef = useRef(null);
  const levelConfig = levelManager.getCurrentLevelConfig();

  useEffect(() => { resetLevel(); }, []);

  useEffect(() => {
    if (!gameActive || !gameStarted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [gameActive, gameStarted, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && gameActive) setGameActive(false);
  }, [timeLeft]);

  useEffect(() => {
    const gameState = { matches, timeLeft, score };
    if (levelManager.isLevelComplete(gameState) && gameActive) {
      setGameActive(false);
      
      // Current level score is already being tracked in the score state
      // It gets incremented by 10 for each match in handleCellPress
      const levelScore = score;
      
      if (levelManager.getCurrentLevel() === 10) {
        setTimeout(() => {
          levelManager.advanceLevel(levelScore);
          setShowCongratulations(true);
        }, 2500);
      } else {
        setTimeout(() => {
          levelManager.advanceLevel(levelScore);
          nextLevel();
        }, 2500);
      }
    }
  }, [matches, gameActive]);

  const handleCellPress = (row, col) => {
    if (!gameActive || !gameStarted || gridData[row][col] === null || matchedCells.has(`${row}-${col}`)) return;
    
    setHintedCells(new Set());
    
    if (!selectedCell) {
      setSelectedCell({ row, col });
    } else {
      const { row: prevRow, col: prevCol } = selectedCell;
      if (prevRow === row && prevCol === col) {
        setSelectedCell(null);
        return;
      }
      
      const num1 = gridData[prevRow][prevCol];
      const num2 = gridData[row][col];
      
      if (canMatch(num1, num2) && hasValidPath(gridData, matchedCells, [prevRow, prevCol], [row, col])) {
        const newMatchedCells = new Set(matchedCells);
        newMatchedCells.add(`${prevRow}-${prevCol}`);
        newMatchedCells.add(`${row}-${col}`);
        setMatchedCells(newMatchedCells);
        setScore(prev => prev + 10);
        setMatches(prev => prev + 1);
      }
      
      setAnimatingCells(new Set([`${prevRow}-${prevCol}`, `${row}-${col}`]));
      setTimeout(() => setAnimatingCells(new Set()), 400);
      setSelectedCell(null);
    }
  };

  const handleAddRow = () => {
    if (!gameActive || !gameStarted || addedRows >= levelConfig.maxAddRows) return;
    const newGrid = addNewRow(gridData, matchedCells);
    setGridData(newGrid);
    setAddedRows(prev => prev + 1);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleHint = () => {
    if (!gameActive || !gameStarted || hintsUsed >= levelConfig.hintsAllowed) return;
    
    const possibleMatches = findPossibleMatches(gridData, matchedCells);
    
    if (possibleMatches.length === 0) {
      Alert.alert(
        "No Matches Available",
        "There are currently no possible matches on the board. Try adding a new row!",
        [{ text: "OK" }]
      );
      return;
    }
    
    const randomMatch = possibleMatches[Math.floor(Math.random() * possibleMatches.length)];
    const [[r1, c1], [r2, c2]] = randomMatch;
    setHintedCells(new Set([`${r1}-${c1}`, `${r2}-${c2}`]));
    setHintsUsed(prev => prev + 1);
    setTimeout(() => setHintedCells(new Set()), 2000);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameActive(true);
  };

  const resetLevel = () => {
    const { grid } = levelManager.generateInitialState();
    const config = levelManager.getCurrentLevelConfig();
    setGridData(grid);
    setSelectedCell(null);
    setMatchedCells(new Set());
    setScore(0);
    setMatches(0);
    setTimeLeft(config.timeLimit);
    setGameActive(false);
    setGameStarted(false);
    setAddedRows(0);
    setHintsUsed(0);
    setAnimatingCells(new Set());
    setHintedCells(new Set());
  };

  const nextLevel = () => {
    setTimeout(() => resetLevel(), 100);
  };

  const restartGame = () => {
    levelManager.resetGame();
    setShowCongratulations(false);
    setTimeout(() => resetLevel(), 100);
  };

  const jumpToLevel = (level) => {
    levelManager.currentLevel = level;
    setShowLevelSelector(false);
    setTimeout(() => resetLevel(), 100);
  };

  if (showCongratulations) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <SafeAreaView style={styles.safeContainer}>
            <View style={styles.congratsScreen}>
              <Text style={styles.trophy}>🏆</Text>
              <Text style={styles.congratsTitle}>CONGRATULATIONS!</Text>
              <Text style={styles.congratsText}>You completed all 10 levels!</Text>
              <Text style={styles.totalScore}>Total Score: {levelManager.getTotalScore()}</Text>
              <TouchableOpacity style={styles.playAgainButton} onPress={restartGame}>
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent={Platform.OS === 'android'} />
        <SafeAreaView style={styles.safeContainer}>
          <GameHeader 
            currentLevel={levelManager.getCurrentLevel()}
            levelName={levelConfig.name}
            difficulty={levelConfig.difficulty}
            // onLevelSelect={() => setShowLevelSelector(true)} // COMMENTED OUT FOR TESTING
          />

          {gameStarted && (
            <>
              <GameStats 
                matches={matches}
                targetMatches={levelConfig.targetMatches}
                timeLeft={timeLeft}
                score={score}
              />

              <GameControls 
                onHint={handleHint}
                onAddRow={handleAddRow}
                onReset={resetLevel}
                hintsRemaining={levelConfig.hintsAllowed - hintsUsed}
                rowsRemaining={levelConfig.maxAddRows - addedRows}
                disabled={!gameActive}
              />
            </>
          )}

          <View style={styles.gameBoard}>
            {!gameStarted ? (
              <StartScreen levelConfig={levelConfig} onStart={startGame} />
            ) : !gameActive && timeLeft === 0 ? (
              <View style={styles.endScreen}>
                <Text style={styles.endTitle}>Time Up!</Text>
                <Text style={styles.endScore}>Level Score: {score}</Text>
                <Text style={styles.totalScoreSmall}>Total Score: {levelManager.getTotalScore()}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={resetLevel}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : !gameActive && matches >= levelConfig.targetMatches ? (
              <View style={styles.endScreen}>
                <Text style={styles.endTitle}>Level Complete!</Text>
                <Text style={styles.endScore}>Level Score: {score}</Text>
                {/* Show cumulative score for all levels */}
                <Text style={styles.totalScoreSmall}>
                  Total Score: {levelManager.getTotalScore() + score}
                </Text>
                <Text style={styles.loadingText}>Loading next level...</Text>
              </View>
            ) : (
              <GameGrid 
                gridData={gridData}
                selectedCell={selectedCell}
                hintedCells={hintedCells}
                matchedCells={matchedCells}
                animatingCells={animatingCells}
                onCellPress={handleCellPress}
                scrollViewRef={scrollViewRef}
              />
            )}
          </View>

          {/* LEVEL SELECTOR MODAL - COMMENTED OUT FOR TESTING */}
          {/* 
          <Modal visible={showLevelSelector} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Level</Text>
                <ScrollView style={styles.levelList}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => {
                    const config = new NumberMatchStrategy().getLevelConfig(level);
                    return (
                      <TouchableOpacity 
                        key={level} 
                        style={styles.levelItem}
                        onPress={() => jumpToLevel(level)}
                      >
                        <View style={styles.levelInfo}>
                          <Text style={styles.levelNumber}>Level {level}</Text>
                          <Text style={styles.levelDetail}>{config.name} - {config.difficulty}</Text>
                          <Text style={styles.levelStats}>
                            Rows: {config.initialRows} | Add: {config.maxAddRows} | Target: {config.targetMatches} | Hints: {config.hintsAllowed}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowLevelSelector(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          */}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  safeContainer: { 
    flex: 1, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  gameBoard: { 
    flex: 1, 
    marginHorizontal: 15, 
    marginBottom: 15 
  },
  congratsScreen: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#FFFFFF', 
    margin: 20, 
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#595984ff',
    shadowColor: '#595984ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  trophy: { 
    fontSize: 80, 
    marginBottom: 20 
  },
  congratsTitle: { 
    fontSize: 28, 
    color: '#595984ff', 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  congratsText: { 
    fontSize: 16, 
    color: '#374151', 
    marginBottom: 20 
  },
  totalScore: { 
    fontSize: 22, 
    color: '#595984ff', 
    fontWeight: 'bold', 
    marginBottom: 30 
  },
  totalScoreSmall: {
    fontSize: 16,
    color: '#595984ff',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 15
  },
  playAgainButton: { 
    backgroundColor: '#595984ff', 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 25,
    shadowColor: '#595984ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  playAgainText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  endScreen: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    margin: 10, 
    padding: 20,
    borderWidth: 3,
    borderColor: '#595984ff',
    shadowColor: '#595984ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  endTitle: { 
    fontSize: 28, 
    color: '#595984ff', 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  endScore: { 
    fontSize: 18, 
    color: '#374151', 
    marginBottom: 10 
  },
  loadingText: { 
    fontSize: 14, 
    color: '#6B7280',
    marginTop: 10
  },
  retryButton: { 
    backgroundColor: '#595984ff', 
    paddingHorizontal: 25, 
    paddingVertical: 12, 
    borderRadius: 20,
    shadowColor: '#595984ff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    marginTop: 10
  },
  retryText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  // Modal styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(37, 99, 235, 0.25)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#FFFFFF', 
    width: '85%', 
    maxHeight: '80%', 
    borderRadius: 20, 
    padding: 20,
    borderWidth: 2,
    borderColor: '#595984ff',
    shadowColor: '#595984ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: { 
    fontSize: 18, 
    color: '#595984ff', 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center' 
  },
  levelList: { 
    maxHeight: 400 
  },
  levelItem: { 
    backgroundColor: '#F9FAFB', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 2, 
    borderColor: '#595984ff' 
  },
  levelInfo: {},
  levelNumber: { 
    fontSize: 16, 
    color: '#595984ff', 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  levelDetail: { 
    fontSize: 13, 
    color: '#374151', 
    marginBottom: 4 
  },
  levelStats: { 
    fontSize: 11, 
    color: '#6B7280' 
  },
  closeButton: { 
    backgroundColor: '#595984ff', 
    paddingVertical: 12, 
    borderRadius: 12, 
    marginTop: 15,
    shadowColor: '#595984ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
});