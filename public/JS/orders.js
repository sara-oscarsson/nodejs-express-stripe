window.addEventListener("load", async () => {
  let response = await fetch("/orders", {
    headers: { "Content-Type": "application/json" },
    method: "GET",
  })
    .then((result) => {
      return result.json();
    })
    .then((answer) => {
      if (!answer) {
        location.replace("http://localhost:3000");
      } else {
        console.log(answer);
        let listedOrders = document.getElementById("listedOrders");
        answer.forEach((order) => {
          const receipt = document.createElement('div');
          receipt.classList.add('receipt');

          const orderDate = document.createElement("h2");
          orderDate.innerText = "Order date: " + order.orderdProducts.date;

          const orderPrice = document.createElement("h4");
          orderPrice.innerText = "Total price: " + order.totalPrice;

          const textHolder = document.createElement('div');
          textHolder.classList.add('textHolder');

          const orderID = document.createElement("p");
          orderID.innerText = "Order ID: " + order.orderId;

          textHolder.appendChild(orderID);
          receipt.append(orderDate, orderPrice, textHolder);
          listedOrders.appendChild(receipt);
        });
      }
    })
    .catch((err) => console.error(err));
});
