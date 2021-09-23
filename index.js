const cookie = require("cookie-session");
const { response } = require("express");
const express = require("express");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const fs = require("fs");
const app = express();

const env = require("dotenv").config(".env");

//Collect secret api key from .env file
const secretKey = process.env.STRIPE_SECRET_KEY;
//Connect that key to stripe?
const stripe = require("stripe")(secretKey);

app.use(express.static("public"));
app.use(express.json());

app.use(
  cookie({
    secret: "kldnvkfdnsvdkfnsv!1",
    maxAge: 1000 * 10,
    sameSite: "strict",
    httpOnly: true,
    secure: false,
  })
);

app.post("/createUser", async (req, res) => {
  let unparsedUserList = fs.readFileSync("users.json");
  let userList = JSON.parse(unparsedUserList);
  let userExist = userList.find((user) => {
    return user.name === req.body.name;
  });
  if (userExist) {
    //Don't run code if userExist is true
    res.json("User already exists");
    return;
  }

  /* Connect to stripe here 🤠 */

  const hashedPwd = await bcrypt.hash(req.body.pwd, 10);

  /* Save customerid here in object */
  let newUser = {
    username: req.body.name,
    password: hashedPwd,
  };
  userList.push(newUser);
  fs.writeFileSync("users.json", JSON.stringify(userList));
  res.json("User was successfully created");
});

app.post("/login", async (req, res) => {
  let unparsedUserList = fs.readFileSync("users.json");
  let userList = JSON.parse(unparsedUserList);
  console.log(userList);
  let userExist = userList.find((user) => {
    return user.username === req.body.name;
  });
  if (!userExist || !await bcrypt.compare(req.body.pwd, userExist.password)) {
    //Don't run code if userExist is true
    res.json("Username or password is wrong");
    return;
  }

  if (req.session.id) {
    return res.json("You are already logged in");
  }

  req.session.id = uuid.v4();
  req.session.username = req.body.name;
  req.session.loginDate = new Date().toLocaleString();
  res.json("Successfully logged in!");
});

app.post("/payment", async (req, res) => {
  //Save body in variable
  let boughtCars = req.body;
  //Create empty array to put line_items in
  let carsToStripe = [];
  //Loop through body to create one line_item for every product
  boughtCars.forEach((boughtCar) => {
    let lineItem = {
      description: boughtCar.car.description,
      price_data: {
        currency: "sek",
        product_data: {
          name: boughtCar.car.model,
        },
        unit_amount: boughtCar.car.price * 100,
      },
      quantity: boughtCar.quantity,
    };
    carsToStripe.push(lineItem);
  });

  //Save time and date for order
  let orderDate = new Date().toLocaleString();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: carsToStripe,
    mode: "payment",
    metadata: {
      date: orderDate,
    },
    success_url: `http://localhost:3000/success.html`,
    cancel_url: "https://localhost:3000/cancel.html",
  });
  res.status(200).json({ id: session.id });
});

app.post("/verify", async (req, res) => {
  //Session id is sent in req.body
  const sessionID = req.body.sessionID;

  //We collect info about the session from stripe
  const paymentInfo = await stripe.checkout.sessions.retrieve(sessionID);

  //Check if order is paid
  if (paymentInfo.payment_status === "paid") {
    //Create an object containing order info to save in json-file
    let order = {
      orderId: paymentInfo.id,
      totalPrice: paymentInfo.amount_total,
      orderdProducts: paymentInfo.metadata,
    };
    //Get list of verified orders and parse it
    let unParsedOrderlist = fs.readFileSync("verification.json");
    let orderList = JSON.parse(unParsedOrderlist);

    //Check if order already exists
    let alreadyExist = orderList.find((orderItem) => {
      return orderItem.orderID === order.orderId;
    });
    if (alreadyExist) {
      //Don't run code if alreadyExists is true
      res.json("Order already exists");
      return;
    }
    //Save new order in json-file
    orderList.push(order);
    fs.writeFileSync("verification.json", JSON.stringify(orderList));

    res.json(true);
  }
});

app.listen(3000);
