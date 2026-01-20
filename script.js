/* =========================================================
   ページ読み込み完了後にゲーム全体を初期化する
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- ゲーム基本設定 ---------- */
  const boardSize = 4;              // 盤面サイズ（4×4）
  let board = [];                   // 盤面の数値管理用配列
  let score = 0;                    // 現在のスコア
  let gameOver = false;             // ゲームオーバー判定
  let gameCleared = false;          // 2048達成済み判定

  let history = [];                 // Undo 用の履歴
  let mergedPositions = [];         // マージ演出用
  let newTilePosition = null;       // 新規タイル位置

  const gameBoard = document.getElementById("game-board");

  /* ---------- セル（16マス）の生成 ---------- */
  for (let i = 0; i < boardSize * boardSize; i++) {
    const div = document.createElement("div");
    div.className = "cell";
    gameBoard.appendChild(div);
  }
  const cells = document.querySelectorAll(".cell");

  /* ---------- 盤面配列の初期化 ---------- */
  function initBoard() {
    board = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill(0)
    );
  }

  /* ---------- ゲーム開始／リスタート処理 ---------- */
  function startGame() {
    initBoard();
    score = 0;
    gameOver = false;
    gameCleared = false;
    history = [];

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

  /* ---------- Undo 用に盤面状態を保存 ---------- */
  function saveState() {
    history.push({
      board: board.map(r => [...r]),
      score
    });
  }

  /* ---------- 直前の状態へ戻す ---------- */
  function undo() {
    if (!history.length) return;

    const prev = history.pop();
    board = prev.board.map(r => [...r]);
    score = prev.score;

    updateBoard();
    updateScore();
  }

  document.getElementById("undo").addEventListener("click", undo);

  /* ---------- ランダムタイル生成 ---------- */
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

  /* ---------- 盤面描画処理 ---------- */
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
        } else {
          cell.textContent = "";
        }
        index++;
      }
    }

    mergedPositions = [];
    newTilePosition = null;
  }

  /* ---------- スコア表示・ハイスコア保存 ---------- */
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

  /* ---------- 行を詰める（0を右に寄せる） ---------- */
  function slide(row) {
    const r = row.filter(v => v);
    while (r.length < boardSize) r.push(0);
    return r;
  }

  /* ---------- タイル結合処理 ---------- */
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

  /* ---------- 各方向への移動処理 ---------- */
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
    for (let c = 0; c < boardSize; c++) {
      const col = merge(board.map(r => r[c]));
      for (let r = 0; r < boardSize; r++) board[r][c] = col[r];
    }
  }

  function moveDown() {
    for (let c = 0; c < boardSize; c++) {
      const col = merge(board.map(r => r[c]).reverse()).reverse();
      for (let r = 0; r < boardSize; r++) board[r][c] = col[r];
    }
  }

  /* ---------- 勝敗判定 ---------- */
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

  /* ---------- キーボード操作 ---------- */
  window.addEventListener("keydown", e => {
    if (gameOver) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;

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

  /* ---------- スコア送信（Googleフォーム） ---------- */
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

  /* ---------- 各種ボタン操作 ---------- */
  document.getElementById("restart").addEventListener("click", startGame);
  document.getElementById("restart-btn").addEventListener("click", startGame);
  document.getElementById("continue-btn").addEventListener("click", () => {
    document.getElementById("clear-overlay").classList.add("hidden");
  });

  /* ---------- 初回起動 ---------- */
  startGame();
});
