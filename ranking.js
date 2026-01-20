const sheetURL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfyP3Uit3d8wD-qpFTifTIfP2S_LWQX6WuwlWeADqVbhSMDdQ/gviz/tq?tqx=out:json";

fetch(sheetURL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const data = rows.map(r => ({
      name: r.c[1]?.v ?? "",
      score: Number(r.c[2]?.v ?? 0)
    }));

    const bestMap = {};
    data.forEach(item => {
      if (!item.name) return;
      if (!bestMap[item.name] || item.score > bestMap[item.name]) {
        bestMap[item.name] = item.score;
      }
    });

    const ranking = Object.entries(bestMap)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);

    const list = document.getElementById("ranking-list");
    list.innerHTML = "";

    const myName = localStorage.getItem("nickname");

    ranking.slice(0, 10).forEach((item, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}位 ${item.name} : ${item.score}`;

      if (item.name === myName) {
        li.style.color = "#e67e22";
        li.style.fontWeight = "bold";
      }
      list.appendChild(li);
    });
  });

const nicknameInput = document.getElementById("nickname-input");
document.getElementById("entry-btn").addEventListener("click", () => {
  const name = nicknameInput.value.trim();
  if (!name) {
    alert("ニックネームを入力してください");
    return;
  }
  localStorage.setItem("nickname", name);
  alert(`「${name}」でランキングに参加します`);
});
