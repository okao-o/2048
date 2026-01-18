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
  document.addEventListener("keydown", handleKeyDown);

function handleKeyDown(event) {
  if (event.key === "ArrowLeft") {
    moveLeft();
    updateBoard();
  }
}

  updateBoard();
}
function slideRowLeft(row) {
  let newRow = row.filter(value => value !== 0);

  while (newRow.length < boardSize) {
    newRow.push(0);
  }

  return newRow;
}

startGame();
function moveLeft() {
  for (let i = 0; i < boardSize; i++) {
    board[i] = slideRowLeft(board[i]);
  }
}
