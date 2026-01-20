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

