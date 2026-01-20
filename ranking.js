const sheetURL =
  "https://docs.google.com/spreadsheets/d/1GuWisZRu6ameV_UfD69I6RDWZeAnI2MmduurxAD9VGQ/gviz/tq?tqx=out:json";

fetch(sheetURL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const data = rows.map(r => ({
      name: r.c[1]?.v ?? "",
      score: Number(r.c[2]?.v ?? 0)
    }));

    data.sort((a, b) => b.score - a.score);

    const list = document.getElementById("ranking-list");
    list.innerHTML = "";

    data.slice(0, 10).forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} : ${item.score}`;
      list.appendChild(li);
    });
  });



const nicknameInput = document.getElementById("nickname-input");
const entryBtn = document.getElementById("entry-btn");

entryBtn.addEventListener("click", () => {
  const name = nicknameInput.value.trim();
  if (!name) {
    alert("ニックネームを入力してください");
    return;
  }

  localStorage.setItem("nickname", name);
  alert(`「${name}」でランキングに参加します`);
});
