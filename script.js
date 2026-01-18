document.addEventListener("DOMContentLoaded", () => {

  const boardSize = 4;
  let board = [];
  let score = 0;
  let gameOver = false;
  let gameCleared = false;

  const gameBoard = document.getElementById("game-board");

  // 16セルを自動生成
  for (let i = 0; i < boardSize * boardSize; i++) {
    const div = document.createElement("div");
    div.className = "cell";
    gameBoard.appendChild(div);
  }

  const cells = document.querySelectorAll(".cell");

  // ---------- 初期化 ----------
  function initBoard() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  }

  function addRandomTile() {
    const empty = [];
    board.forEach((row, i) =>
      row.forEach((v,j) => { if (v === 0) empty.push({i,j}); })
    );
    if (!empty.length) return;
    const {i,j} = empty[Math.floor(Math.random()*empty.length)];
    board[i][j] = Math.random() < 0.9 ? 2 : 4;
  }

  function updateBoard() {
    let index = 0;
    for (let i=0;i<boardSize;i++){
      for (let j=0;j<boardSize;j++){
        const cell = cells[index];
        const value = board[i][j];
        cell.className = "cell";
        if (value !== 0){
          cell.textContent = value;
          cell.classList.add(`tile-${value}`);
        } else cell.textContent = "";
        index++;
      }
    }
  }

  function updateScore() {
    document.getElementById("score").textContent = "Score: " + score;
    const hs = Math.max(score, Number(localStorage.getItem("highScore")||0));
    localStorage.setItem("highScore", hs);
    document.getElementById("high-score").textContent = "High Score: " + hs;
  }

  // ---------- ゲーム開始 ----------
  function startGame() {
    initBoard();
    score = 0; gameOver = false; gameCleared = false;
    cells.forEach(c => { c.textContent=""; c.className="cell"; });
    addRandomTile();
    addRandomTile();
    updateBoard();
    updateScore();
    document.getElementById("clear-overlay").classList.add("hidden");
  }

  startGame();

  document.getElementById("restart").addEventListener("click", startGame);
  document.getElementById("restart-btn").addEventListener("click", startGame);
  document.getElementById("continue-btn").addEventListener("click", () => {
    document.getElementById("clear-overlay").classList.add("hidden");
  });

  // ---------- 移動 ----------
  function slide(row) { const r=row.filter(v=>v); while(r.length<boardSize) r.push(0); return r; }
  function merge(row){
    row=slide(row);
    for(let i=0;i<boardSize-1;i++){
      if(row[i]!==0 && row[i]===row[i+1]){
        row[i]*=2; score+=row[i]; row[i+1]=0;
      }
    }
    return slide(row);
  }

  function moveLeft(){ for(let i=0;i<boardSize;i++) board[i]=merge(board[i]); }
  function moveRight(){ for(let i=0;i<boardSize;i++) board[i]=merge(board[i].slice().reverse()).reverse(); }
  function moveUp(){
    for(let c=0;c<boardSize;c++){
      const col=merge(board.map(r=>r[c]));
      for(let r=0;r<boardSize;r++) board[r][c]=col[r];
    }
  }
  function moveDown(){
    for(let c=0;c<boardSize;c++){
      const col=merge(board.map(r=>r[c]).reverse()).reverse();
      for(let r=0;r<boardSize;r++) board[r][c]=col[r];
    }
  }

  function has2048(){ return board.some(r=>r.includes(2048)); }
  function hasEmpty(){ return board.some(r=>r.includes(0)); }
  function canMerge(){ return board.some((row,i)=>row.some((v,j)=> (v && ((i<boardSize-1 && v===board[i+1][j]) || (j<boardSize-1 && v===board[i][j+1]))))); }
  function isGameOver(){ return !hasEmpty() && !canMerge(); }

  function showClearOverlay(){ document.getElementById("clear-overlay").classList.remove("hidden"); }

  // ---------- キー操作 ----------
  window.addEventListener("keydown", e => {
    if(gameOver) return;
    if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) e.preventDefault();
    const before = JSON.stringify(board);
    if(e.key==="ArrowLeft") moveLeft();
    if(e.key==="ArrowRight") moveRight();
    if(e.key==="ArrowUp") moveUp();
    if(e.key==="ArrowDown") moveDown();
    const after=JSON.stringify(board);
    if(before!==after){ addRandomTile(); updateBoard(); updateScore(); 
      if(has2048() && !gameCleared){ showClearOverlay(); gameCleared=true; }
      if(isGameOver()){ gameOver=true; alert("詰み😭"); }
    }
  });

  // ---------- タッチ操作 ----------
  let tStartX=0, tStartY=0;
  gameBoard.addEventListener("touchstart", e=>{
    tStartX=e.touches[0].clientX;
    tStartY=e.touches[0].clientY;
  }, {passive:false});
  gameBoard.addEventListener("touchmove", e=>e.preventDefault(), {passive:false});
  gameBoard.addEventListener("touchend", e=>{
    const dx=e.changedTouches[0].clientX-tStartX;
    const dy=e.changedTouches[0].clientY-tStartY;
    if(Math.abs(dx)>Math.abs(dy)){
      if(dx>30) window.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight"}));
      if(dx<-30) window.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowLeft"}));
    } else {
      if(dy>30) window.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowDown"}));
      if(dy<-30) window.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowUp"}));
    }
  }, {passive:false});

});
