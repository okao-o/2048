function submitScore(nickname, score) {
  const formURL = "https://docs.google.com/forms/d/e/XXXXXXXXXXXX/formResponse";

  const data = new FormData();
  data.append("entry.apiproxy78ffdedc057b5c9893cb73e5e93c24fd369fc6a30.1117175448", nickname);
  data.append("entry.apiproxy1bebbc6a250f2dcc00b475b1d15c79aa0ebf8b180.904413126", score);

  fetch(formURL, {
    method: "POST",
    mode: "no-cors",
    body: data
  });
}

const nickname = localStorage.getItem("nickname");
if (nickname) {
  submitScore(nickname, score);
}



const sheetURL =
  "https://docs.google.com/spreadsheets/d/1GuWisZRu6ameV_UfD69I6RDWZeAnI2MmduurxAD9VGQ/gviz/tq?tqx=out:json";

fetch(sheetURL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const data = rows.map(r => ({
      name: r.c[0]?.v ?? "",
      score: Number(r.c[1]?.v ?? 0)
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
