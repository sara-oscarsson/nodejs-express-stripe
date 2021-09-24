const send = document.getElementById("send");
send.addEventListener("click", createAccount);

const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', loginFunction);

async function loginFunction() {
  let loginUsername = document.getElementById("loginUsername");
  let loginPassword = document.getElementById("loginPassword");

  if (loginUsername.value === "" || loginPassword.value === "") {
    alert("Fyll i alla fält");
    return;
  }
  let loginUser = {
    name: loginUsername.value,
    pwd: loginPassword.value,
  };

  let response = await fetch("/login", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(loginUser),
  })
    .then((result) => {
      return result.json();
    })
    .then((answer) => {
      if(answer.login === true) {
        location.replace('http://localhost:3000')
      } else{
        alert('Wrong name or password!')
      }
    })
    .catch((err) => console.error(err));
}

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
        alert(answer);
        username.value = '';
        password.value = '';
      
    })
    .catch((err) => console.error(err));
}
