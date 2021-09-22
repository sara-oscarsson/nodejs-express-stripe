window.addEventListener("load", async () => {
  let sessionID = localStorage.getItem("sessionID");
  let verify = await fetch("/verify", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      sessionID,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.error(err));
});
