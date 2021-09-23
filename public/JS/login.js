const send = document.getElementById("send");
send.addEventListener("click", createAccount);

async function createAccount() {
  let username = document.getElementById("username");
  let password = document.getElementById("password");

  if (username.value === "" || password.value === "") {
    alert("Fyll i alla fält");
    return;
  }

  let newUser = {
    name: username.value,
    pwd: password.value,
  };

  let response = await fetch("/createUser", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(newUser),
  })
    .then((result) => {
      return result.json();
    })
    .then((answer) => {
      console.log(answer);
    })
    .catch((err) => console.error(err));
}
