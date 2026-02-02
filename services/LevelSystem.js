/**
 * UNIVERSAL LEVEL SYSTEM - Works with ANY game
 * Design Pattern: Strategy Pattern
 * Grid System: 7 columns × 9 rows
 */

import { GRID_COLUMNS, GRID_ROWS } from '../utils/gameLogic';

export class LevelStrategy {
  getDifficultyMultiplier(levelNumber) { 
    throw new Error('Must implement'); 
  }
  
  getLevelConfig(levelNumber) { 
    throw new Error('Must implement'); 
  }
  
  isLevelComplete(gameState, config) { 
    throw new Error('Must implement'); 
  }
  
  generateInitialGrid(config) { 
    throw new Error('Must implement'); 
  }
}

export class NumberMatchStrategy extends LevelStrategy {
  getDifficultyMultiplier(levelNumber) {
    return 1 + (levelNumber - 1) * 0.15;
  }

  getLevelConfig(levelNumber) {
    const levels = {
      1: { level: 1, name: "Tutorial", difficulty: "Easy", initialRows: 3, maxAddRows: 0, timeLimit: 180, targetMatches: 8, hintsAllowed: 5 },
      2: { level: 2, name: "Beginner", difficulty: "Easy", initialRows: 4, maxAddRows: 1, timeLimit: 150, targetMatches: 12, hintsAllowed: 3 },
      3: { level: 3, name: "Learning", difficulty: "Easy", initialRows: 4, maxAddRows: 2, timeLimit: 140, targetMatches: 15, hintsAllowed: 3 },
      4: { level: 4, name: "Rising", difficulty: "Medium", initialRows: 5, maxAddRows: 2, timeLimit: 130, targetMatches: 18, hintsAllowed: 2 },
      5: { level: 5, name: "Halfway", difficulty: "Medium", initialRows: 5, maxAddRows: 3, timeLimit: 120, targetMatches: 20, hintsAllowed: 2 },
      6: { level: 6, name: "Advanced", difficulty: "Hard", initialRows: 6, maxAddRows: 3, timeLimit: 110, targetMatches: 22, hintsAllowed: 1 },
      7: { level: 7, name: "Expert", difficulty: "Hard", initialRows: 6, maxAddRows: 3, timeLimit: 110, targetMatches: 24, hintsAllowed: 1 },
      8: { level: 8, name: "Master", difficulty: "Expert", initialRows: 7, maxAddRows: 4, timeLimit: 100, targetMatches: 26, hintsAllowed: 1 },
      9: { level: 9, name: "Champion", difficulty: "Expert", initialRows: 7, maxAddRows: 4, timeLimit: 100, targetMatches: 28, hintsAllowed: 0 },
      10: { level: 10, name: "Legend", difficulty: "Master", initialRows: 8, maxAddRows: 4, timeLimit: 90, targetMatches: 30, hintsAllowed: 0 },
    };
    return levels[levelNumber] || levels[1];
  }

  isLevelComplete(gameState, config) {
    return gameState.matches >= config.targetMatches;
  }

  generateInitialGrid(config) {
    const grid = [];
    
    // Create initial rows with numbers
    for (let i = 0; i < config.initialRows; i++) {
      const row = [];
      for (let j = 0; j < GRID_COLUMNS; j++) {
        row.push(Math.floor(Math.random() * 9) + 1);
      }
      grid.push(row);
    }
    
    
    // This gives space for the first few "Add Row" actions
    const emptyRowBuffer = 3;
    for (let i = 0; i < emptyRowBuffer; i++) {
      grid.push(new Array(GRID_COLUMNS).fill(null));
    }
    
    return { grid };
  }
}

export class LevelManager {
  constructor(strategy) {
    this.strategy = strategy;
    this.currentLevel = 1;
    this.totalScore = 0;
    this.maxLevel = 10;
  }

  getCurrentLevel() { 
    return this.currentLevel; 
  }

  getCurrentLevelConfig() { 
    return this.strategy.getLevelConfig(this.currentLevel); 
  }

  advanceLevel(score) {
    this.totalScore += score;
    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      return { success: true, nextLevel: this.currentLevel };
    }
    return { success: false, gameComplete: true };
  }

  resetGame() {
    this.currentLevel = 1;
    this.totalScore = 0;
  }

  isLevelComplete(gameState) {
    return this.strategy.isLevelComplete(gameState, this.getCurrentLevelConfig());
  }

  generateInitialState() {
    return this.strategy.generateInitialGrid(this.getCurrentLevelConfig());
  }

  getTotalScore() { 
    return this.totalScore; 
  }
}