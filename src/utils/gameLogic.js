export const createBoard = (rows, cols, mines) => {
  let board = [];
  // Initialize empty board
  for (let x = 0; x < rows; x++) {
    let row = [];
    for (let y = 0; y < cols; y++) {
      row.push({
        x,
        y,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      });
    }
    board.push(row);
  }

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const x = Math.floor(Math.random() * rows);
    const y = Math.floor(Math.random() * cols);

    if (!board[x][y].isMine) {
      board[x][y].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbor mines
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      if (!board[x][y].isMine) {
        let count = 0;
        // Check all 8 neighbors
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
              if (board[nx][ny].isMine) count++;
            }
          }
        }
        board[x][y].neighborMines = count;
      }
    }
  }

  return board;
};

// Helper to reveal cell in place (mutates board)
const revealCellInPlace = (board, x, y) => {
  const rows = board.length;
  const cols = board[0].length;

  if (board[x][y].isRevealed || board[x][y].isFlagged) return { hitMine: false };

  board[x][y].isRevealed = true;

  if (board[x][y].isMine) {
    return { hitMine: true };
  }

  if (board[x][y].neighborMines === 0) {
    // Flood fill
    const stack = [[x, y]];
    while (stack.length > 0) {
      const [cx, cy] = stack.pop();

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;

          if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
            if (!board[nx][ny].isRevealed && !board[nx][ny].isFlagged) {
              board[nx][ny].isRevealed = true;
              if (board[nx][ny].neighborMines === 0) {
                stack.push([nx, ny]);
              }
            }
          }
        }
      }
    }
  }

  return { hitMine: false };
};

export const revealCell = (board, x, y) => {
  let newBoard = structuredClone(board);
  const { hitMine } = revealCellInPlace(newBoard, x, y);
  return { board: newBoard, hitMine };
};

export const chordReveal = (board, x, y) => {
  let newBoard = structuredClone(board);
  const rows = newBoard.length;
  const cols = newBoard[0].length;
  const cell = newBoard[x][y];

  // Must be revealed and have neighbors to chord
  if (!cell.isRevealed || cell.neighborMines === 0) {
    return { board: newBoard, hitMine: false, revealedSomething: false };
  }

  // Count flagged neighbors
  let flaggedCount = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
        if (newBoard[nx][ny].isFlagged) flaggedCount++;
      }
    }
  }

  if (flaggedCount !== cell.neighborMines) {
    return { board: newBoard, hitMine: false, revealedSomething: false };
  }

  // Reveal unflagged neighbors
  let hitMine = false;
  let revealedSomething = false;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
        if (!newBoard[nx][ny].isFlagged && !newBoard[nx][ny].isRevealed) {
          const result = revealCellInPlace(newBoard, nx, ny);
          if (result.hitMine) hitMine = true;
          revealedSomething = true;
        }
      }
    }
  }

  return { board: newBoard, hitMine, revealedSomething };
};

export const toggleFlag = (board, x, y) => {
  let newBoard = structuredClone(board);
  if (newBoard[x][y].isRevealed) return newBoard;
  newBoard[x][y].isFlagged = !newBoard[x][y].isFlagged;
  return newBoard;
};

export const checkWin = (board) => {
  for (let row of board) {
    for (let cell of row) {
      if (!cell.isMine && !cell.isRevealed) return false;
    }
  }
  return true;
};

export const revealAllMines = (board) => {
  let newBoard = structuredClone(board);
  for (let row of newBoard) {
    for (let cell of row) {
      if (cell.isMine) cell.isRevealed = true;
    }
  }
  return newBoard;
}

export const revealRandomSafeCell = (board, count = 1) => {
  if (count <= 0) return board;

  let newBoard = structuredClone(board);

  for (let i = 0; i < count; i++) {
    const rows = newBoard.length;
    const cols = newBoard[0].length;
    const safeCells = [];

    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        if (!newBoard[x][y].isMine &&
          newBoard[x][y].neighborMines === 0 &&
          !newBoard[x][y].isRevealed) {
          safeCells.push({ x, y });
        }
      }
    }

    if (safeCells.length > 0) {
      const randomCell = safeCells[Math.floor(Math.random() * safeCells.length)];
      revealCellInPlace(newBoard, randomCell.x, randomCell.y);
    } else {
      // No more safe cells to reveal
      break;
    }
  }

  return newBoard;
};
