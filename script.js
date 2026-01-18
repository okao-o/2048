let score = 0;
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
      const cell = cells[index];

      // tile-* クラスだけ削除
      cell.classList.forEach(cls => {
        if (cls.startsWith("tile-")) {
          cell.classList.remove(cls);
        }
      });

      if (value !== 0) {
        cell.textContent = value;
        cell.classList.add("tile-" + value);
      } else {
        cell.textContent = "";
      }

      index++;
    }
  }
}


function startGame() {
  initBoard();
  score = 0;
  gameOver = false;


  // ★ すべてのセル表示を完全リセット
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => {
    cell.textContent = "";
    cell.className = "cell";
  });

  addRandomTile();
  updateBoard();
  updateScore();
}



startGame();


window.addEventListener("keydown", handleKeyDown);


function handleKeyDown(event) {
  if (gameOver) return;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
  }

  const beforeBoard = JSON.stringify(board);

  if (event.key === "ArrowLeft") {
    moveLeft();
  } else if (event.key === "ArrowRight") {
    moveRight();
  } else if (event.key === "ArrowUp") {
    moveUp();
  } else if (event.key === "ArrowDown") {
    moveDown();
  }

  const afterBoard = JSON.stringify(board);

  // 盤面が変わったときだけ新しいタイルを出す
  if (beforeBoard !== afterBoard) {
    addRandomTile();
    updateBoard();
    updateScore();
  }
  
if (has2048()) {
  alert("2048 達成！クリア！");
}

  // ★ ゲームオーバー判定
  if (isGameOver()) {
    alert("ゲームオーバー");
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
  row = slideRowLeft(row);

  for (let i = 0; i < boardSize - 1; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];   // ★ スコア加算
      row[i + 1] = 0;
    }
  }

  row = slideRowLeft(row);
  return row;
}

function boardsAreEqual(board1, board2) {
  return JSON.stringify(board1) === JSON.stringify(board2);
}
function reverseRow(row) {
  return row.slice().reverse();
}
function moveRight() {
  for (let i = 0; i < boardSize; i++) {
    let reversedRow = reverseRow(board[i]);
    reversedRow = mergeRowLeft(reversedRow);
    board[i] = reverseRow(reversedRow);
  }
}
function getColumn(colIndex) {
  let column = [];
  for (let i = 0; i < boardSize; i++) {
    column.push(board[i][colIndex]);
  }
  return column;
}
function setColumn(colIndex, column) {
  for (let i = 0; i < boardSize; i++) {
    board[i][colIndex] = column[i];
  }
}
function moveUp() {
  for (let col = 0; col < boardSize; col++) {
    let column = getColumn(col);
    column = mergeRowLeft(column);
    setColumn(col, column);
  }
}
function moveDown() {
  for (let col = 0; col < boardSize; col++) {
    let column = getColumn(col);
    column = reverseRow(column);
    column = mergeRowLeft(column);
    column = reverseRow(column);
    setColumn(col, column);
  }
}
window.onload = () => {
  document.body.focus();
};

function hasEmptyCell() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 0) {
        return true;
      }
    }
  }
  return false;
}

function canMerge() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const current = board[i][j];

      if (
        j < boardSize - 1 &&
        current !== 0 &&
        current === board[i][j + 1]
      ) {
        return true;
      }

      if (
        i < boardSize - 1 &&
        current !== 0 &&
        current === board[i + 1][j]
      ) {
        return true;
      }
    }
  }
  return false;
}


function isGameOver() {
  return !hasEmptyCell() && !canMerge();
}

function updateScore() {
  document.getElementById("score").textContent = "Score: " + score;
  updateHighScore();
}

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener(
  "touchmove",
  function (event) {
    event.preventDefault();
  },
  { passive: false }
);

document.addEventListener("touchstart", function (event) {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: false });

document.addEventListener("touchend", function (event) {
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) {
      handleKeyDown({ key: "ArrowRight", preventDefault: () => {} });
    } else if (dx < -30) {
      handleKeyDown({ key: "ArrowLeft", preventDefault: () => {} });
    }
  } else {
    if (dy > 30) {
      handleKeyDown({ key: "ArrowDown", preventDefault: () => {} });
    } else if (dy < -30) {
      handleKeyDown({ key: "ArrowUp", preventDefault: () => {} });
    }
  }
}, { passive: false });

function has2048() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 2048) {
        return true;
      }
    }
  }
  return false;
}

function updateHighScore() {
  const highScore = localStorage.getItem("highScore") || 0;

  if (score > highScore) {
    localStorage.setItem("highScore", score);
  }

  document.getElementById("high-score").textContent =
    "High Score: " + localStorage.getItem("highScore");
}

let gameOver = false;

if (isGameOver()) {
  gameOver = true;
  alert("ゲームオーバー");
}
