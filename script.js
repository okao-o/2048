const boardSize = 4;
let board = [];
function initBoard() {
  board = [];

  for (let i = 0; i < boardSize; i++) {
    const row = [];
    for (let j = 0; j < boardSize; j++) {
      row.push(0);
    }
    board.push(row);
  }
}
function addRandomTile() {
  let emptyCells = [];

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 0) {
        emptyCells.push({ x: i, y: j });
      }
    }
  }

  if (emptyCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cell = emptyCells[randomIndex];
    board[cell.x][cell.y] = 2;
  }
}
function updateBoard() {
  const cells = document.querySelectorAll(".cell");

  let index = 0;
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const value = board[i][j];
      cells[index].textContent = value === 0 ? "" : value;
      index++;
    }
  }
}
function startGame() {
  initBoard();
  addRandomTile();
  updateBoard();
}

startGame();


document.addEventListener("keydown", handleKeyDown);

function handleKeyDown(event) {
  if (event.key === "ArrowLeft") {
    const beforeBoard = JSON.stringify(board);

    moveLeft();

    const afterBoard = JSON.stringify(board);

    if (beforeBoard !== afterBoard) {
      addRandomTile();
    }

    updateBoard();
  }
}


function slideRowLeft(row) {
  let newRow = row.filter(value => value !== 0);

  while (newRow.length < boardSize) {
    newRow.push(0);
  }

  return newRow;
}

function moveLeft() {
  for (let i = 0; i < boardSize; i++) {
    board[i] = mergeRowLeft(board[i]);
  }
}

function mergeRowLeft(row) {
  // ① まず左に詰める
  row = slideRowLeft(row);

  // ② 合体処理
  for (let i = 0; i < boardSize - 1; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      row[i + 1] = 0;
    }
  }

  // ③ もう一度左に詰める
  row = slideRowLeft(row);

  return row;
}
function boardsAreEqual(board1, board2) {
  return JSON.stringify(board1) === JSON.stringify(board2);
}
