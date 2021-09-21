window.addEventListener("load", () => {
  renderProducts(products);
});

function renderProducts(products) {
  let displayDiv = document.getElementById("displayProducts");
  products.forEach((product) => {
    let card = document.createElement("div");
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
