/**
 * REUSABLE GAME LOGIC UTILITIES
 * Pure functions - no side effects
 * Grid System: 7 columns × 9 rows
 */
export const GRID_COLUMNS = 7; // Number of columns in the grid
export const GRID_ROWS = 9;    // Number of rows in the grid

export const hasValidPath = (grid, matchedCells, pos1, pos2) => {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  if (r1 === r2 && c1 === c2) return false;
  if (isDirectLine(grid, matchedCells, pos1, pos2)) return true;
  return hasOneTurnPath(grid, matchedCells, pos1, pos2);
};

const isDirectLine = (grid, matchedCells, pos1, pos2) => {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  const dr = r2 - r1;
  const dc = c2 - c1;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = steps === 0 ? 0 : dr / steps;
  const stepC = steps === 0 ? 0 : dc / steps;
  for (let i = 1; i < steps; i++) {
    const checkR = r1 + Math.round(stepR * i);
    const checkC = c1 + Math.round(stepC * i);
    if (grid[checkR] && grid[checkR][checkC] !== null && 
        !matchedCells.has(`${checkR}-${checkC}`)) {
      return false;
    }
  }
  return true;
};

const hasOneTurnPath = (grid, matchedCells, pos1, pos2) => {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  const corner1 = [r1, c2];
  if ((!grid[corner1[0]] || grid[corner1[0]][corner1[1]] === null || 
      matchedCells.has(`${corner1[0]}-${corner1[1]}`)) &&
      isDirectLine(grid, matchedCells, pos1, corner1) && 
      isDirectLine(grid, matchedCells, corner1, pos2)) {
    return true;
  }
  const corner2 = [r2, c1];
  if ((!grid[corner2[0]] || grid[corner2[0]][corner2[1]] === null || 
      matchedCells.has(`${corner2[0]}-${corner2[1]}`)) &&
      isDirectLine(grid, matchedCells, pos1, corner2) && 
      isDirectLine(grid, matchedCells, corner2, pos2)) {
    return true;
  }
  return false;
};

export const findPossibleMatches = (grid, matchedCells) => {
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
          if (num1 === num2 || num1 + num2 === 10) {
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

export const canMatch = (num1, num2) => {
  return num1 === num2 || num1 + num2 === 10;
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * UPDATED: Add a new row after the last existing row in the grid
 * This ensures rows are added sequentially, including after grey (matched) rows
 */
export const addNewRow = (grid, matchedCells) => {
  const existingNums = grid.flat().filter(n => n !== null);
  const newRow = [];
  
  // Generate new row
  for (let i = 0; i < GRID_COLUMNS; i++) {
    if (Math.random() < 0.7 && existingNums.length > 0) {
      const randomNum = existingNums[Math.floor(Math.random() * existingNums.length)];
      if (Math.random() < 0.6) {
        newRow.push(randomNum);
      } else {
        const complement = 10 - randomNum;
        newRow.push(complement > 0 && complement <= 9 ? complement : randomNum);
      }
    } else {
      newRow.push(Math.floor(Math.random() * 9) + 1);
    }
  }
  
  // Find the last row that has ANY cells (including matched/grey ones)
  let lastRowIndex = -1;
  for (let i = grid.length - 1; i >= 0; i--) {
    const hasAnyCells = grid[i].some(cell => cell !== null);
    if (hasAnyCells) {
      lastRowIndex = i;
      break;
    }
  }
  
  // Insert the new row right after the last row with any cells
  const newGrid = [...grid];
  const insertIndex = lastRowIndex + 1;
  
  // If insert index is within the existing grid, replace that row
  if (insertIndex < newGrid.length) {
    newGrid[insertIndex] = newRow;
  } else {
    // Otherwise append to the end
    newGrid.push(newRow);
  }
  
  return newGrid;
};