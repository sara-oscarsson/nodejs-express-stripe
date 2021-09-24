window.addEventListener("load", () => {
  showWhatsInCart();
  checkLogin();
});
let buyButton = document.getElementById("buyBtn");
buyButton.addEventListener("click", youAreNowBroke);

async function checkLogin() {
  let response = await fetch("/checkUser", {
    headers: { "Content-Type": "application/json" },
    method: "GET"
  })
    .then((result) => {
      return result.json();
    })
    .then((answer) => {
      if(!answer) {
        buyButton.disabled = true;
      } 
    })
    .catch((err) => console.error(err));
}

//Connect to stripe with publishable key??
let stripe = Stripe(
  "pk_test_51Jc8njIyEKoWmrdFxr80HrBTOYFNs9uo8qNCRz6slhLv5CY6zGH622D2i1CXVU5WtCzapgHCXI4v96i9t6iJdp7j00UgqRplu5"
);


function showWhatsInCart() {
  let currentCart = localStorage.getItem("cart");
  currentCart = JSON.parse(currentCart);

  let productsInCart = document.querySelector("#productsFromCart");
  if (currentCart == null) {
    productsInCart.innerText = "Nothing in cart..";
    return;
  }
  currentCart.forEach((cartItem) => {
    let card = document.createElement("div");
    card.style.display = "flex";
    card.style.flexDirection = "row";
    card.style.justifyContent = "space-between";
    card.style.padding = "20px";
    card.style.margin = "20px";
    card.style.border = "1px solid black";

    let leftContent = document.createElement("div");
    leftContent.style.display = "flex";
    leftContent.style.flexDirection = "column";

    let title = document.createElement("h3");
    title.innerText = cartItem.car.model;

    let quantity = document.createElement("h4");
    quantity.innerText = "Antal: " + cartItem.quantity;

    let rightContent = document.createElement("div");
    rightContent.style.width = "100px";
    rightContent.style.height = "inherit";

    let carImage = document.createElement("img");
    carImage.style.width = "inherit";
    carImage.style.height = "inherit";
    carImage.style.objectFit = "cover";

    carImage.src = cartItem.car.image;

    rightContent.appendChild(carImage);
    leftContent.append(title, quantity);
    card.append(leftContent, rightContent);
    productsInCart.appendChild(card);
  });
  totalPriceCalculator();
}

function totalPriceCalculator() {
  let totalPriceDiv = document.getElementById("totalPrice");
  let totalPrice = 0;

  let currentCart = localStorage.getItem("cart");
  currentCart = JSON.parse(currentCart);

  currentCart.forEach((cartItem) => {
    let oneProductKind = Number(cartItem.quantity) * Number(cartItem.car.price);
    totalPrice += oneProductKind;
  });
  totalPriceDiv.innerText = totalPrice + ":-";
}

async function youAreNowBroke() {
  let currentCart = localStorage.getItem("cart");
  let respone = await fetch("/payment", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: currentCart,
  })
    .then((result) => {
      return result.json();
    })
    .then((session) => {
      console.log(session);
      localStorage.setItem("sessionID", session.id);
      localStorage.removeItem("cart");
      return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .catch((err) => console.error(err));
}
