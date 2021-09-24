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
          const orderDate = document.createElement("h2");
          orderDate.innerText = "Order date: " + order.orderdProducts.date;
          const orderPrice = document.createElement("h4");
          orderPrice.innerText = "Total price: " + order.totalPrice;
          const orderID = document.createElement("h5");
          orderID.innerText = "Order ID: " + order.orderId;
          listedOrders.append(orderDate, orderPrice, orderID)
        });
      }
    })
    .catch((err) => console.error(err));
});
