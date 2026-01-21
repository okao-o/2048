/* ---------- Googleフォーム送信 ---------- */
function submitScore(nickname, score) {
  const formURL =
    "https://docs.google.com/forms/d/e/1FAIpQLSfyP3Uit3d8wD-qpFTifTIfP2S_LWQX6WuwlWeADqVbhSMDdQ/formResponse";

  const data = new FormData();
  data.append("entry.890016593", nickname); // ニックネーム
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

    const myName = localStorage.getItem("nickname");

    ranking.forEach((item, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}位 ${item.name} : ${item.score}`;

      if (item.name === myName) {
        li.style.color = "#e67e22";
        li.style.fontWeight = "bold";
      }

      list.appendChild(li);
    });
  });

/* ---------- ニックネーム登録（初回送信） ---------- */
const nicknameInput = document.getElementById("nickname-input");
const entryBtn = document.getElementById("entry-btn");

entryBtn.addEventListener("click", () => {
  const name = nicknameInput.value.trim();
  if (!name) {
    alert("ニックネームを入力してください");
    return;
  }

  localStorage.setItem("nickname", name);

  const highScore = Number(localStorage.getItem("highScore") || 0);
  if (highScore > 0) {
    submitScore(name, highScore);
  }

  alert(`「${name}」でランキングに参加します`);
});
