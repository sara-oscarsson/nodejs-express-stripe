window.addEventListener("load", () => {
  renderProducts(products);
  checkLogin();
});

window.addEventListener('scroll', headerFunction);

function headerFunction() {
  let header = document.getElementById('header');
  let y = window.scrollY;
  if(y > 20) {
    header.classList.add('color');
  } else {
    header.classList.remove('color');
  }
}

let loginBtn = document.getElementById("loginBtn");
let logoutBtn = document.getElementById("logoutBtn");
let orderPage = document.getElementById("orderPage");

logoutBtn.addEventListener("click", async () => {

  localStorage.removeItem("login");
  loginBtn.style.display = "block";
  logoutBtn.style.display = "none";
  orderPage.style.display= "none";
  
  let response = await fetch("/logout", {
    headers: { "Content-Type": "application/json" },
    method: "DELETE",
  })
    .then((result) => {
      return result.json();
    })
    .then((answer) => {
      console.log(answer);
    })
    .catch((err) => console.error(err));
});

async function checkLogin() {
  let response = await fetch("/checkUser", {
    headers: { "Content-Type": "application/json" },
    method: "GET",
  })
    .then((result) => {
      return result.json();
    })
    .then((answer) => {
      if (answer) {
        localStorage.setItem("login", JSON.stringify(answer));
        loginBtn.style.display = "none";
      } else {
        localStorage.removeItem("login");
        logoutBtn.style.display = "none";
        orderPage.style.display= "none";
      }
    })
    .catch((err) => console.error(err));
}

function renderProducts(products) {
  let displayDiv = document.getElementById("displayProducts");
  products.forEach((product) => {
    let card = document.createElement("div");
    card.style.marginTop= '80px';
    card.classList.add("productCard");

    let model = document.createElement("h2");
    model.innerText = product.model;

    let productImage = document.createElement("img");
    productImage.src = product.image;

    let productDescription = document.createElement("h3");
    productDescription.innerText = product.description;

    let price = document.createElement("h5");
    price.innerText = product.price + ":-";

    let addToCartButton = document.createElement("button");
    addToCartButton.innerText = "Add to cart";

    addToCartButton.addEventListener("click", () => {
      let currentCart = localStorage.getItem("cart");
      currentCart = JSON.parse(currentCart);
      if (currentCart === null) {
        currentCart = [];
      }

      let foundIndex = currentCart.findIndex((cartItem) => {
        return cartItem.car.model == product.model;
      });

      if (foundIndex != -1) {
        currentCart[foundIndex].quantity++;
      } else {
        currentCart.push({
          car: product,
          quantity: 1,
        });
      }
      localStorage.setItem("cart", JSON.stringify(currentCart));
    });

    card.append(
      model,
      productImage,
      productDescription,
      price,
      addToCartButton
    );
    displayDiv.appendChild(card);
  });
}
