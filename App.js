import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Animated, 
  StatusBar,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');

const LEVELS = {
  1: {
    name: "Easy",
    initialGrid: [
      [3, 7, 2, 8],
      [1, 9, 4, 6], 
      [5, 5, 1, 3]
    ],
    timeLimit: 120,
    maxAddRows: 3, 
    targetMatches: 8
  },
  2: {
    name: "Medium", 
    initialGrid: [
      [2, 8, 1, 9],
      [3, 7, 5, 2],
      [4, 6, 8, 1],
      [9, 3, 7, 4]
    ],
    timeLimit: 120,
    maxAddRows: 3,
    targetMatches: 12
  },
  3: {
    name: "Hard",
    initialGrid: [
      [1, 9, 2, 8],
      [6, 4, 7, 3],
      [5, 5, 1, 6],
      [9, 2, 8, 4],
      [3, 7, 9, 1]
    ],
    timeLimit: 120,
    maxAddRows: 3, 
    targetMatches: 15
  }
};

// Check if path exists between two cells (including diagonal)
const hasValidPath = (grid, matchedCells, pos1, pos2) => {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  
  // Same position
  if (r1 === r2 && c1 === c2) return false;
  
  // Direct line check (horizontal, vertical, diagonal)
  if (isDirectLine(grid, matchedCells, pos1, pos2)) return true;
  
  // One turn path check
  return hasOneTurnPath(grid, matchedCells, pos1, pos2);
};

const isDirectLine = (grid, matchedCells, pos1, pos2) => {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  
  const dr = r2 - r1;
  const dc = c2 - c1;
  
  // Not a straight line
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;
  
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = steps === 0 ? 0 : dr / steps;
  const stepC = steps === 0 ? 0 : dc / steps;
  
  // Check all cells between start and end
  for (let i = 1; i < steps; i++) {
    const checkR = r1 + Math.round(stepR * i);
    const checkC = c1 + Math.round(stepC * i);
    
    if (grid[checkR] && grid[checkR][checkC] !== null && 
        !matchedCells.has(`${checkR}-${checkC}`)) {
      return false; // Path blocked by unmatched cell
    }
  }
  
  return true;
};

const hasOneTurnPath = (grid, matchedCells, pos1, pos2) => {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  
  // Try corner at (r1, c2)
  const corner1 = [r1, c2];
  if ((!grid[corner1[0]] || grid[corner1[0]][corner1[1]] === null || 
       matchedCells.has(`${corner1[0]}-${corner1[1]}`)) &&
      isDirectLine(grid, matchedCells, pos1, corner1) && 
      isDirectLine(grid, matchedCells, corner1, pos2)) {
    return true;
  }
  
  // Try corner at (r2, c1)  
  const corner2 = [r2, c1];
  if ((!grid[corner2[0]] || grid[corner2[0]][corner2[1]] === null || 
       matchedCells.has(`${corner2[0]}-${corner2[1]}`)) &&
      isDirectLine(grid, matchedCells, pos1, corner2) && 
      isDirectLine(grid, matchedCells, corner2, pos2)) {
    return true;
  }
  
  return false;
};

// Find possible matches for hints
const findPossibleMatches = (grid, matchedCells) => {
  const matches = [];
  
  for (let r1 = 0; r1 < grid.length; r1++) {
    for (let c1 = 0; c1 < grid[r1].length; c1++) {
      if (grid[r1][c1] === null || matchedCells.has(`${r1}-${c1}`)) continue;
      
      for (let r2 = 0; r2 < grid.length; r2++) {
        for (let c2 = 0; c2 < grid[r2].length; c2++) {
          if (grid[r2][c2] === null || matchedCells.has(`${r2}-${c2}`)) continue;
          if (r1 === r2 && c1 === c2) continue;
          
          const num1 = grid[r1][c1];
          const num2 = grid[r2][c2];
          
          // Check if numbers match
          if (num1 === num2 || num1 + num2 === 10) {
            // Check if path exists
            if (hasValidPath(grid, matchedCells, [r1, c1], [r2, c2])) {
              matches.push([[r1, c1], [r2, c2]]);
            }
          }
        }
      }
    }
  }
  
  return matches;
};

const GameCell = ({ number, row, col, isSelected, isHinted, isMatched, onPress, animationType }) => {
  const animatedValue = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (isMatched) return; // Don't allow interaction with matched cells
    
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
    <Animated.View
      style={[
        styles.cell,
        isSelected && styles.selectedCell,
        isHinted && styles.hintedCell,
        isMatched && styles.matchedCell,
        { transform: [{ scale: animatedValue }, { translateX: shakeAnimation }] }
      ]}
    >
      <TouchableOpacity onPress={handlePress} style={styles.cellTouchable} disabled={isMatched}>
        <Text style={[styles.cellText, isMatched && styles.matchedCellText]}>{number}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function App() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedCell, setSelectedCell] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [matchedCells, setMatchedCells] = useState(new Set()); // Track matched cells
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameActive, setGameActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [addedRows, setAddedRows] = useState(0);
  const [animatingCells, setAnimatingCells] = useState(new Set());
  const [hintedCells, setHintedCells] = useState(new Set());
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [showNoMovesDialog, setShowNoMovesDialog] = useState(false);
  const scrollViewRef = useRef(null);

  // Initialize game
  useEffect(() => {
    resetCurrentLevel();
  }, []);

  // Timer
  useEffect(() => {
    if (!gameActive || !gameStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, gameStarted, timeLeft]);

  // Check for no moves available
  useEffect(() => {
    if (gameActive && gameStarted && !showNoMovesDialog) {
      const possibleMatches = findPossibleMatches(gridData, matchedCells);
      const levelConfig = LEVELS[currentLevel];
      
      // Check if no moves and no more rows can be added
      if (possibleMatches.length === 0 && addedRows >= levelConfig.maxAddRows) {
        setShowNoMovesDialog(true);
      }
    }
  }, [gridData, matchedCells, gameActive, gameStarted, addedRows, currentLevel, showNoMovesDialog]);

  // Check game over
  useEffect(() => {
    if (timeLeft === 0 && gameActive) {
      setGameActive(false);
    }
  }, [timeLeft]);

  // Check level complete
  useEffect(() => {
    const levelConfig = LEVELS[currentLevel];
    if (matches >= levelConfig.targetMatches && gameActive) {
      setGameActive(false);
      setTotalScore(prev => prev + score);
      
      if (currentLevel === 3) {
        
        setTimeout(() => setShowCongratulations(true), 1000);
      } else {
        setTimeout(() => nextLevel(), 1000);
      }
    }
  }, [matches, currentLevel, score]);

  const handleCellPress = (row, col) => {
    if (!gameActive || !gameStarted || gridData[row][col] === null || 
        matchedCells.has(`${row}-${col}`)) return;
    
    // Clear hints
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
      
      // Check match rules
      const canMatch = num1 === num2 || num1 + num2 === 10;
      
      if (canMatch && hasValidPath(gridData, matchedCells, [prevRow, prevCol], [row, col])) {
        // Valid match 
        const newMatchedCells = new Set(matchedCells);
        newMatchedCells.add(`${prevRow}-${prevCol}`);
        newMatchedCells.add(`${row}-${col}`);
        setMatchedCells(newMatchedCells);
        
        setScore(prev => prev + 10);
        setMatches(prev => prev + 1);
        
        setAnimatingCells(new Set([`${prevRow}-${prevCol}`, `${row}-${col}`]));
        setTimeout(() => setAnimatingCells(new Set()), 400);
      } else {
        // Invalid match
        setAnimatingCells(new Set([`${prevRow}-${prevCol}`, `${row}-${col}`]));
        setTimeout(() => setAnimatingCells(new Set()), 400);
      }
      
      setSelectedCell(null);
    }
  };

  const addRow = () => {
    if (!gameActive || !gameStarted) return;
    
    const levelConfig = LEVELS[currentLevel];
    if (addedRows >= levelConfig.maxAddRows) return;
    
    // Generate more strategic numbers for better matching
    const existingNums = gridData.flat().filter(n => n !== null);
    const newRow = [];
    
    for (let i = 0; i < 4; i++) {
      if (Math.random() < 0.7 && existingNums.length > 0) {
        const randomNum = existingNums[Math.floor(Math.random() * existingNums.length)];
        // Higher chance of adding same number or complement to 10
        if (Math.random() < 0.6) {
          newRow.push(randomNum); // Same number
        } else {
          const complement = 10 - randomNum;
          newRow.push(complement > 0 && complement <= 9 ? complement : randomNum);
        }
      } else {
        newRow.push(Math.floor(Math.random() * 9) + 1);
      }
    }
    
    setGridData(prev => [...prev, newRow]);
    setAddedRows(prev => prev + 1);
    
    // Auto scroll to bottom to show new row
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const showHint = () => {
    if (!gameActive || !gameStarted) return;
    
    const possibleMatches = findPossibleMatches(gridData, matchedCells);
    if (possibleMatches.length > 0) {
      const randomMatch = possibleMatches[Math.floor(Math.random() * possibleMatches.length)];
      const [[r1, c1], [r2, c2]] = randomMatch;
      
      setHintedCells(new Set([`${r1}-${c1}`, `${r2}-${c2}`]));
      
      // Clear hint after 2 seconds
      setTimeout(() => setHintedCells(new Set()), 2000);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameActive(true);
  };

  const resetCurrentLevel = () => {
    const levelConfig = LEVELS[currentLevel];
    setSelectedCell(null);
    setGridData(levelConfig.initialGrid.map(row => [...row]));
    setMatchedCells(new Set()); // Reset matched cells
    setScore(0);
    setMatches(0);
    setTimeLeft(levelConfig.timeLimit);
    setGameActive(false);
    setGameStarted(false);
    setAddedRows(0);
    setAnimatingCells(new Set());
    setHintedCells(new Set());
    setShowNoMovesDialog(false);
  };

  const handleNoMovesReset = () => {
    setShowNoMovesDialog(false);
    resetCurrentLevel();
  };

  const nextLevel = () => {
    if (currentLevel < 3) {
      setCurrentLevel(currentLevel + 1);
      setTimeout(() => resetCurrentLevel(), 100);
    }
  };

  const restartFromLevel1 = () => {
    setShowCongratulations(false);
    setCurrentLevel(1);
    setTotalScore(0);
    setTimeout(() => resetCurrentLevel(), 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const levelConfig = LEVELS[currentLevel];
  const progressPercent = (matches / levelConfig.targetMatches) * 100;

  if (showCongratulations) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="#1a1a2e" 
            translucent={Platform.OS === 'android'} 
          />
          <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
            <View style={styles.congratulationsScreen}>
              <Text style={styles.trophyIcon}>🏆</Text>
              <Text style={styles.congratulationsTitle}>🎉 CONGRATULATIONS! 🎉</Text>
              <Text style={styles.congratulationsText}>
                You've completed all levels!
              </Text>
              <Text style={styles.totalScoreText}>
                Total Score: {totalScore + score}
              </Text>
              <TouchableOpacity 
                style={styles.playAgainButton} 
                onPress={restartFromLevel1}
              >
                <Text style={styles.playAgainButtonText}>🔄 Play Again</Text>
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
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#1a1a2e" 
          translucent={Platform.OS === 'android'} 
        />
        <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <Text style={styles.title}>Number Match</Text>
            <Text style={styles.levelTitle}>Level {currentLevel} - {levelConfig.name}</Text>
          </View>

          <View style={styles.gameInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Matches</Text>
              <Text style={styles.infoValue}>{matches}/{levelConfig.targetMatches}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={[styles.infoValue, timeLeft < 30 && styles.urgentTime]}>
                {formatTime(timeLeft)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Score</Text>
              <Text style={styles.infoValue}>{score}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.floor(progressPercent)}%</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.button, styles.hintButton]} 
              onPress={showHint}
              disabled={!gameActive || !gameStarted}
            >
              <Text style={styles.buttonText}>💡 Hint</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.button, 
                styles.addButton,
                (addedRows >= levelConfig.maxAddRows || !gameActive || !gameStarted) && styles.disabledButton
              ]} 
              onPress={addRow}
              disabled={!gameActive || !gameStarted || addedRows >= levelConfig.maxAddRows}
            >
              <Text style={styles.buttonText}>➕ Add Row ({addedRows}/{levelConfig.maxAddRows})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetCurrentLevel}>
              <Text style={styles.buttonText}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gameBoard}>
            {(showNoMovesDialog && matches < levelConfig.targetMatches) ? (
              <View style={styles.noMovesScreen}>
                <Ionicons name="alert-circle" size={60} color="#FF9500" />
                <Text style={styles.noMovesTitle}>No Moves Available!</Text>
                <Text style={styles.noMovesText}>
                  There are no more possible matches and you've used all additional rows.
                </Text>
                <TouchableOpacity style={styles.resetFromNoMovesButton} onPress={handleNoMovesReset}>
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.resetFromNoMovesButtonText}>Reset Level</Text>
                </TouchableOpacity>
              </View>
            ) : !gameStarted ? (
              <View style={styles.startScreen}>
                <Text style={styles.startTitle}>Ready to Play?</Text>
                <Text style={styles.startRules}>
                  • Match same numbers or pairs that sum to 10{'\n'}
                  • Numbers can connect in straight lines or with one turn{'\n'}
                  • Diagonal connections are allowed{'\n'}
                  • Get {levelConfig.targetMatches} matches to win!
                </Text>
                <TouchableOpacity style={styles.startButton} onPress={startGame}>
                  <Text style={styles.startButtonText}>START GAME</Text>
                </TouchableOpacity>
              </View>
            ) : !gameActive && timeLeft === 0 ? (
              <View style={styles.gameOverScreen}>
                <Text style={styles.gameOverText}>Time Up!</Text>
                <Text style={styles.finalScore}>Final Score: {score}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={resetCurrentLevel}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : !gameActive && matches >= levelConfig.targetMatches ? (
              <View style={styles.winScreen}>
                <Text style={styles.winText}>Level Complete!</Text>
                <Text style={styles.finalScore}>Score: {score}</Text>
                {currentLevel < 3 ? (
                  <Text style={styles.nextLevelText}>Loading next level...</Text>
                ) : (
                  <Text style={styles.nextLevelText}>Preparing congratulations...</Text>
                )}
              </View>
            ) : (
              <View style={styles.gridContainer}>
                <ScrollView 
                  ref={scrollViewRef}
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
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
                            onPress={handleCellPress}
                            animationType={animatingCells.has(`${rowIndex}-${colIndex}`) ? 'shake' : null}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8, 
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#fff',
  },
  levelTitle: {
    fontSize: 15, 
    color: '#4A90E2',
    fontWeight: '600',
    marginTop: 2,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10, 
    backgroundColor: '#16213e',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10, 
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  urgentTime: {
    color: '#FF4444',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 10, 
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: '#B0B0B0',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10, 
    paddingHorizontal: 15,
    marginBottom: 6, 
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  hintButton: {
    backgroundColor: '#FF9500',
  },
  addButton: {
    backgroundColor: '#4A90E2',
  },
  resetButton: {
    backgroundColor: '#E74C3C',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  gameBoard: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  noMovesScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
    backgroundColor: '#16213e',
    margin: 10,
    borderRadius: 15,
  },
  noMovesTitle: {
    fontSize: 24,
    color: '#FF9500',
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  noMovesText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  resetFromNoMovesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  resetFromNoMovesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
    backgroundColor: '#16213e',
    margin: 10,
    borderRadius: 15,
  },
  startTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  startRules: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameOverScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
    backgroundColor: '#16213e',
    margin: 10,
    borderRadius: 15,
  },
  gameOverText: {
    fontSize: 28,
    color: '#FF4444',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  winScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
    backgroundColor: '#16213e',
    margin: 10,
    borderRadius: 15,
  },
  winText: {
    fontSize: 28,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  finalScore: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  nextLevelText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 0,
    alignSelf: 'center',
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 15,
    margin: 10,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  grid: {
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  cell: {
    width: 50,
    height: 50,
    backgroundColor: '#0f3460',
    margin: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  cellTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCell: {
    backgroundColor: '#4a90e2',
    borderColor: '#fff',
    borderWidth: 3,
  },
  hintedCell: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  matchedCell: {
    backgroundColor: '#2a2a2a',
    borderColor: '#555',
    opacity: 0.4,
  },
  cellText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  matchedCellText: {
    color: '#888',
  },
  emptyCell: {
    width: 50,
    height: 50,
    margin: 2,
  },
  congratulationsScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#16213e',
    margin: 20,
    borderRadius: 15,
  },
  trophyIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  alertIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  congratulationsTitle: {
    fontSize: 28,
    color: '#FFD700',
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  congratulationsText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  totalScoreText: {
    fontSize: 22,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});