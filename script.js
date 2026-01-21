document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 基本設定 ---------- */
  const boardSize = 4;
  let board = [];
  let score = 0;
  let gameOver = false;
  let gameCleared = false;

  let history = [];
  let mergedPositions = [];
  let newTilePosition = null;

  const gameBoard = document.getElementById("game-board");

  /* ---------- セル生成 ---------- */
  for (let i = 0; i < boardSize * boardSize; i++) {
    const div = document.createElement("div");
    div.className = "cell";
    gameBoard.appendChild(div);
  }
  const cells = document.querySelectorAll(".cell");

  /* ---------- 初期化 ---------- */
  function initBoard() {
    board = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill(0)
    );
  }

  function startGame() {
    initBoard();
    score = 0;
    gameOver = false;
    gameCleared = false;
    history = [];
    mergedPositions = [];
    newTilePosition = null;

    cells.forEach(c => {
      c.textContent = "";
      c.className = "cell";
    });

    addRandomTile();
    addRandomTile();
    updateBoard();
    updateScore();

    document.getElementById("clear-overlay").classList.add("hidden");
  }

  /* ---------- Undo ---------- */
  function saveState() {
    history.push({
      board: board.map(r => [...r]),
      score
    });
  }

  function undo() {
    if (!history.length) return;
    const prev = history.pop();
    board = prev.board.map(r => [...r]);
    score = prev.score;
    updateBoard();
    updateScore();
  }

  document.getElementById("undo").addEventListener("click", undo);

  /* ---------- タイル生成 ---------- */
  function addRandomTile() {
    const empty = [];
    board.forEach((row, i) =>
      row.forEach((v, j) => {
        if (v === 0) empty.push({ i, j });
      })
    );
    if (!empty.length) return;

    const pos = empty[Math.floor(Math.random() * empty.length)];
    board[pos.i][pos.j] = Math.random() < 0.9 ? 2 : 4;
    newTilePosition = pos;
  }

  /* ---------- 描画 ---------- */
  function updateBoard() {
    let index = 0;

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const cell = cells[index];
        const value = board[i][j];

        cell.className = "cell";

        if (value !== 0) {
          cell.textContent = value;
          cell.classList.add(`tile-${value}`);

          if (
            newTilePosition &&
            newTilePosition.i === i &&
            newTilePosition.j === j
          ) {
            cell.classList.add("new");
          }

          if (mergedPositions.some(p => p.i === i && p.j === j)) {
            cell.classList.add("merge");
          }
        } else {
          cell.textContent = "";
        }

        index++;
      }
    }

    mergedPositions = [];
    newTilePosition = null;
  }

  function updateScore() {
    document.getElementById("score").textContent = "Score: " + score;

    const hs = Math.max(
      score,
      Number(localStorage.getItem("highScore") || 0)
    );

    localStorage.setItem("highScore", hs);
    document.getElementById("high-score").textContent =
      "High Score: " + hs;
  }

  /* ---------- 移動ロジック ---------- */
  function slide(row) {
    const r = row.filter(v => v);
    while (r.length < boardSize) r.push(0);
    return r;
  }

  function merge(row, rowIndex, isVertical = false) {
    row = slide(row);

    for (let i = 0; i < boardSize - 1; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] *= 2;
        score += row[i];
        row[i + 1] = 0;

        mergedPositions.push(
          isVertical
            ? { i: i, j: rowIndex }
            : { i: rowIndex, j: i }
        );
      }
    }
    return slide(row);
  }

  function moveLeft() {
    for (let i = 0; i < boardSize; i++) {
      board[i] = merge(board[i], i);
    }
  }

  function moveRight() {
    for (let i = 0; i < boardSize; i++) {
      board[i] = merge(board[i].slice().reverse(), i).reverse();
    }
  }

  function moveUp() {
    for (let c = 0; c < boardSize; c++) {
      const col = merge(board.map(r => r[c]), c, true);
      for (let r = 0; r < boardSize; r++) board[r][c] = col[r];
    }
  }

  function moveDown() {
    for (let c = 0; c < boardSize; c++) {
      const col = merge(board.map(r => r[c]).reverse(), c, true).reverse();
      for (let r = 0; r < boardSize; r++) board[r][c] = col[r];
    }
  }

  /* ---------- 判定 ---------- */
  function has2048() { return board.some(r => r.includes(2048)); }
  function hasEmpty() { return board.some(r => r.includes(0)); }
  function canMerge() {
    return board.some((row, i) =>
      row.some((v, j) =>
        v &&
        ((i < 3 && v === board[i + 1][j]) ||
         (j < 3 && v === board[i][j + 1]))
      )
    );
  }

  /* ---------- 入力（キーボード） ---------- */
  window.addEventListener("keydown", e => {
    if (gameOver) return;
    if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) return;

    e.preventDefault();
    saveState();

    const before = JSON.stringify(board);

    if (e.key === "ArrowLeft") moveLeft();
    if (e.key === "ArrowRight") moveRight();
    if (e.key === "ArrowUp") moveUp();
    if (e.key === "ArrowDown") moveDown();

    if (before !== JSON.stringify(board)) {
      addRandomTile();
      updateBoard();
      updateScore();

      if (has2048() && !gameCleared) {
        submitScoreIfReady();
        document.getElementById("clear-overlay").classList.remove("hidden");
        gameCleared = true;
      }

      if (!hasEmpty() && !canMerge()) {
        submitScoreIfReady();
        gameOver = true;
        alert("詰み😭");
      }
    } else {
      history.pop();
    }
  });

  /* ---------- 入力（タッチ操作） ---------- */
  let startX = 0, startY = 0;

  gameBoard.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: false });

  gameBoard.addEventListener("touchmove", e => {
    e.preventDefault();
  }, { passive: false });

  gameBoard.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
      if (dx < -30) window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    } else {
      if (dy > 30) window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      if (dy < -30) window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    }
  }, { passive: false });

  /* ---------- ランキング送信 ---------- */
  function submitScoreIfReady() {
    const nickname = localStorage.getItem("nickname");
    if (!nickname) return;

    const formURL =
      "https://docs.google.com/forms/d/e/1FAIpQLSfyP3Uit3d8wD-qpFTifTIfP2S_LWQX6WuwlWeADqVbhSMDdQ/formResponse";

    const data = new FormData();
    data.append("entry.890016593", nickname);
    data.append("entry.297700271", score);

    fetch(formURL, {
      method: "POST",
      mode: "no-cors",
      body: data
    });
  }

  /* ---------- ボタン ---------- */
  document.getElementById("restart").addEventListener("click", startGame);
  document.getElementById("restart-btn").addEventListener("click", startGame);
  document.getElementById("continue-btn").addEventListener("click", () => {
    document.getElementById("clear-overlay").classList.add("hidden");
  });

  startGame();
});
