let score = 0;
const boardSize = 4;
let board = [];
let cleared = false;

/* ---------- 初期化 ---------- */

function initBoard() {
  board = [];
  for (let i = 0; i < boardSize; i++) {
    board.push(Array(boardSize).fill(0));
  }
}

function startGame() {
  // 盤面初期化
  initBoard();

  // スコアと状態リセット
  score = 0;
  gameOver = false;
  gameCleared = false;

  // セル表示を完全リセット
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => {
    cell.textContent = "";
    cell.className = "cell";
  });

  // 初期タイルは2枚追加する
  addRandomTile();
  addRandomTile();

  // ボード更新
  updateBoard();
  updateScore();

  // クリアオーバーレイ非表示
  const overlay = document.getElementById("clear-overlay");
  if (overlay) overlay.classList.add("hidden");
}


startGame();

/* ---------- タイル生成 ---------- */

function addRandomTile() {
  const emptyCells = [];

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 0) {
        emptyCells.push({ x: i, y: j });
      }
    }
  }

  if (emptyCells.length === 0) return;

  const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[x][y] = Math.random() < 0.9 ? 2 : 4;
}

/* ---------- 描画 ---------- */

function updateBoard() {
  const cells = document.querySelectorAll(".cell");
  let index = 0;

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = cells[index];
      const value = board[i][j];

      cell.className = "cell";

      if (value !== 0) {
        cell.textContent = value;
        cell.classList.add(`tile-${value}`);
      } else {
        cell.textContent = "";
      }

      index++;
    }
  }
}

/* ---------- 操作 ---------- */

window.addEventListener("keydown", handleKeyDown);

function handleKeyDown(event) {
  if (gameOver) return;

  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
  }

  const before = JSON.stringify(board);

  if (event.key === "ArrowLeft") moveLeft();
  if (event.key === "ArrowRight") moveRight();
  if (event.key === "ArrowUp") moveUp();
  if (event.key === "ArrowDown") moveDown();

  const after = JSON.stringify(board);

  if (before !== after) {
    addRandomTile();
    updateBoard();
    updateScore();

   if (has2048() && !gameCleared) {
  showClearOverlay();
  gameCleared = true;
}


   
    }
  }
}

/* ---------- 移動ロジック ---------- */

function slide(row) {
  const newRow = row.filter(v => v !== 0);
  while (newRow.length < boardSize) newRow.push(0);
  return newRow;
}

function merge(row) {
  row = slide(row);
  for (let i = 0; i < boardSize - 1; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
    }
  }
  return slide(row);
}

function moveLeft() {
  for (let i = 0; i < boardSize; i++) {
    board[i] = merge(board[i]);
  }
}

function moveRight() {
  for (let i = 0; i < boardSize; i++) {
    board[i] = merge(board[i].slice().reverse()).reverse();
  }
}

function moveUp() {
  for (let col = 0; col < boardSize; col++) {
    const column = merge(board.map(r => r[col]));
    for (let row = 0; row < boardSize; row++) {
      board[row][col] = column[row];
    }
  }
}

function moveDown() {
  for (let col = 0; col < boardSize; col++) {
    const column = merge(board.map(r => r[col]).reverse()).reverse();
    for (let row = 0; row < boardSize; row++) {
      board[row][col] = column[row];
    }
  }
}

/* ---------- 判定 ---------- */

function has2048() {
  return board.some(row => row.includes(2048));
}

function hasEmptyCell() {
  return board.some(row => row.includes(0));
}

function canMerge() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const v = board[i][j];
      if (
        (i < boardSize - 1 && v === board[i + 1][j]) ||
        (j < boardSize - 1 && v === board[i][j + 1])
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

/* ---------- スコア ---------- */

function updateScore() {
  document.getElementById("score").textContent = "Score: " + score;

  const highScore = Math.max(
    score,
    Number(localStorage.getItem("highScore") || 0)
  );

  localStorage.setItem("highScore", highScore);
  document.getElementById("high-score").textContent =
    "High Score: " + highScore;
}

/* ---------- タッチ操作（ボード限定） ---------- */

const gameBoard = document.getElementById("game-board");
let touchStartX = 0;
let touchStartY = 0;

gameBoard.addEventListener("touchstart", e => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: false });

gameBoard.addEventListener("touchmove", e => {
  e.preventDefault();
}, { passive: false });

gameBoard.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) handleKeyDown({ key: "ArrowRight", preventDefault() {} });
    if (dx < -30) handleKeyDown({ key: "ArrowLeft", preventDefault() {} });
  } else {
    if (dy > 30) handleKeyDown({ key: "ArrowDown", preventDefault() {} });
    if (dy < -30) handleKeyDown({ key: "ArrowUp", preventDefault() {} });
  }
}, { passive: false });


let gameCleared = false;

function showClearOverlay() {
  document.getElementById("clear-overlay").classList.remove("hidden");
}

document.getElementById("continue-btn").addEventListener("click", () => {
  document.getElementById("clear-overlay").classList.add("hidden");
});

document.getElementById("restart-btn").addEventListener("click", () => {
  document.getElementById("clear-overlay").classList.add("hidden");
  startGame();
});

