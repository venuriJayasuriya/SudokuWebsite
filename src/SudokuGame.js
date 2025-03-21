import React, { useState, useEffect } from 'react';
import './SudokuGame.css';

const SudokuGame = () => {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [conflicts, setConflicts] = useState(new Set());
  
  useEffect(() => {
    startNewGame();
  }, [difficulty]);

  const startNewGame = () => {
    const generatedBoard = generateSudoku(difficulty);
    setBoard([...generatedBoard]);
    setInitialBoard(JSON.parse(JSON.stringify(generatedBoard)));
    setSelectedCell(null);
    setConflicts(new Set());
  };

  const generateSudoku = (difficulty) => {
    // First, generate a solved board
    const solvedBoard = Array(9).fill().map(() => Array(9).fill(0));
    solveSudoku(solvedBoard);
    
    // Then, remove numbers based on difficulty
    const clues = {
      'easy': 45,
      'medium': 35,
      'hard': 25
    };
    
    const board = JSON.parse(JSON.stringify(solvedBoard));
    let cellsToRemove = 81 - clues[difficulty];
    
    while (cellsToRemove > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (board[row][col] !== 0) {
        board[row][col] = 0;
        cellsToRemove--;
      }
    }
    
    return board;
  };

  const solveSudoku = (board) => {
    // Simple backtracking algorithm to solve Sudoku
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          // Try numbers 1-9
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          // Shuffle for randomness
          for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
          }
          
          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              
              if (solveSudoku(board)) {
                return true;
              }
              
              board[row][col] = 0; // Backtrack
            }
          }
          return false; // No solution found
        }
      }
    }
    return true; // Board is solved
  };

  const isValid = (board, row, col, num) => {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  };

  const handleCellClick = (row, col) => {
    if (initialBoard[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) return;
    
    const newBoard = [...board];
    newBoard[row][col] = num;
    setBoard(newBoard);
    
    // Validate and update conflicts
    validateBoard(newBoard);
  };

  const validateBoard = (currentBoard) => {
    const newConflicts = new Set();
    
    // Check for conflicts
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = currentBoard[row][col];
        if (value === 0) continue;
        
        // Temporarily remove the value to check if it's valid
        currentBoard[row][col] = 0;
        if (!isValid(currentBoard, row, col, value)) {
          newConflicts.add(`${row},${col}`);
        }
        currentBoard[row][col] = value;
      }
    }
    
    setConflicts(newConflicts);
  };

  const solvePuzzle = () => {
    const solution = JSON.parse(JSON.stringify(board));
    solveSudoku(solution);
    setBoard(solution);
    setConflicts(new Set());
  };

  const resetGame = () => {
    setBoard(JSON.parse(JSON.stringify(initialBoard)));
    setSelectedCell(null);
    setConflicts(new Set());
  };

  const getCellClass = (row, col) => {
    let classes = 'sudoku-cell';
    
    // Add border styling
    if (row % 3 === 0) classes += ' top-border';
    if (col % 3 === 0) classes += ' left-border';
    if (row === 8) classes += ' bottom-border';
    if (col === 8) classes += ' right-border';
    
    // Add selection styling
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      classes += ' selected';
    }
    
    // Add initial number styling
    if (initialBoard[row][col] !== 0) {
      classes += ' initial';
    }
    
    // Add conflict styling
    if (conflicts.has(`${row},${col}`)) {
      classes += ' conflict';
    }
    
    return classes;
  };

  return (
    <div className="sudoku-container">
      <h1>Sudoku Game</h1>
      
      <div className="controls">
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          className="difficulty-select"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={startNewGame} className="new-game-btn">New Game</button>
        <button onClick={resetGame} className="reset-btn">Reset</button>
        <button onClick={solvePuzzle} className="solve-btn">Solve</button>
      </div>
      
      <div className="sudoku-board">
        <div className="grid">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="sudoku-row">
              {row.map((cell, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClass(rowIndex, colIndex)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="number-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            onClick={() => handleNumberInput(num)}
            className="number-btn"
          >
            {num}
          </button>
        ))}
        <button 
          onClick={() => handleNumberInput(0)}
          className="number-btn erase"
        >
          Erase
        </button>
      </div>
    </div>
  );
};

export default SudokuGame;