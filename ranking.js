document.addEventListener("DOMContentLoaded", () => {

/* ---------- Googleフォーム送信 ---------- */
function submitScore(nickname, score) {
  const formURL =
    "https://docs.google.com/forms/d/e/1FAIpQLSfyP3Uit3d8wD-qpFTifTIfP2S_LWQX6WuwlWeADqVbhSMDdQ/formResponse";

  const data = new FormData();
  data.append("entry.890016593", nickname); // ニックネーム（ID付き）
  data.append("entry.297700271", score);    // スコア

  fetch(formURL, {
    method: "POST",
    mode: "no-cors",
    body: data
  });
}

/* ---------- ランキング表示 ---------- */
const sheetURL =
  "https://docs.google.com/spreadsheets/d/1GuWisZRu6ameV_UfD69I6RDWZeAnI2MmduurxAD9VGQ/gviz/tq?tqx=out:json";

fetch(sheetURL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const bestMap = {};

    rows.forEach(r => {
      const name = r.c[1]?.v ?? "";
      const score = Number(r.c[2]?.v ?? 0);
      if (!name) return;

      if (!bestMap[name] || score > bestMap[name]) {
        bestMap[name] = score;
      }
    });

    const ranking = Object.entries(bestMap)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const list = document.getElementById("ranking-list");
    list.innerHTML = "";

    const myName = localStorage.getItem("nicknameWithId");

    /* ---------- ニックネーム重複判定用 ---------- */
const baseNameCount = {};

// まず全ランキングから「素のニックネーム」を数える
ranking.forEach(item => {
  const baseName = item.name.split("#")[0];
  baseNameCount[baseName] = (baseNameCount[baseName] || 0) + 1;
});

/* ---------- ランキング描画 ---------- */
ranking.forEach((item, i) => {
  const li = document.createElement("li");
  li.classList.add("ranking-item");

  const [baseName, id] = item.name.split("#");
  const isDuplicated = baseNameCount[baseName] > 1;

  li.innerHTML = `
    <span class="rank">${i + 1}位</span>
    <span class="name">
      ${baseName}
      ${isDuplicated ? `<span class="rank-id">#${id}</span>` : ""}
    </span>
    <span class="score">${item.score}</span>
  `;

  /* 自分のスコアを強調 */
  if (item.name === myName) {
    li.style.color = "#e67e22";
    li.style.fontWeight = "bold";
  }

  list.appendChild(li);
});

    
});

/* ---------- ニックネーム登録（初回のみ） ---------- */
const nicknameInput = document.getElementById("nickname-input");
const entryBtn = document.getElementById("entry-btn");
const entryBox = document.getElementById("entry-box");

/* すでに登録済みなら入力欄を非表示 */
const savedName = localStorage.getItem("nicknameWithId");
if (savedName) {
  entryBox.style.display = "none";
}

entryBtn.addEventListener("click", () => {
  const baseName = nicknameInput.value.trim();
  if (!baseName) {
    alert("ニックネームを入力してください");
    return;
  }

  /* 最終確認 */
  const ok = confirm(`「${baseName}」でランキングに参加します。\n※ニックネームは後から変更できません。`);
  if (!ok) return;

  /* 固有ID生成（6桁） */
  const id = crypto.randomUUID().slice(0, 6);
  const nameWithId = `${baseName}#${id}`;

  localStorage.setItem("nickname", baseName);
  localStorage.setItem("nicknameWithId", nameWithId);

  /* その時点のハイスコアを初回送信 */
  const highScore = Number(localStorage.getItem("highScore") || 0);
  if (highScore > 0) {
    submitScore(nameWithId, highScore);
  }

  entryBox.style.display = "none";
  alert(`「${baseName}」でランキングに参加しました！`);
});





/* ---------- インフォメーションモーダル制御 ---------- */
const infoBtn = document.getElementById("info-btn");
const modal = document.getElementById("info-modal");
const closeBtn = document.getElementById("modal-close");

/* 開く */
infoBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

/* ×ボタンで閉じる */
closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

/* 背景クリックで閉じる */
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

/* Escキーで閉じる */
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.classList.add("hidden");
  }
});

/* ---------- infoモーダル 初回自動表示 ---------- */
const INFO_SEEN_KEY = "infoModalSeen";

if (!localStorage.getItem(INFO_SEEN_KEY)) {
  // 少し遅らせて自然に表示
  setTimeout(() => {
    modal.classList.remove("hidden");
  }, 500);

  localStorage.setItem(INFO_SEEN_KEY, "true");
}
  
});
