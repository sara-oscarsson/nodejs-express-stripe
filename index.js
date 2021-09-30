const cookie = require("cookie-session");
const { response } = require("express");
const express = require("express");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const fs = require("fs");
const app = express();

const env = require("dotenv").config(".env");

// Collect secret api key from .env file
const secretKey = process.env.STRIPE_SECRET_KEY;
// Connects key to stripe
const stripe = require("stripe")(secretKey);

app.use(express.static("public"));
app.use(express.json());

// Creates cookie session
app.use(
  cookie({
    secret: "kldnvkfdnsvdkfnsv!1",
    maxAge: 1000 * 60 * 60,
    sameSite: "strict",
    httpOnly: true,
    secure: false,
  })
);

// Check if cookie session is live
app.get("/checkUser", (req, res) => {
  if (req.session.id) {
    res.json(req.session.username);
  } else {
    res.json(false);
  }
});

// Creates user
app.post("/createUser", async (req, res) => {
  let unparsedUserList = fs.readFileSync("users.json");
  let userList = JSON.parse(unparsedUserList);
  let userExist = userList.find((user) => {
    return user.username === req.body.name;
  });
  if (userExist) {
    // Don't run code if userExist is true
    return res.json("User already exists");
  }

  // Create a stripe customer
  const customer = await stripe.customers.create({
    name: req.body.name,
  });

  const hashedPwd = await bcrypt.hash(req.body.pwd, 10);

  /* Save customerid here in object */
  let newUser = {
    username: req.body.name,
    password: hashedPwd,
    customerID: customer.id,
  };
  userList.push(newUser);
  fs.writeFileSync("users.json", JSON.stringify(userList));
  res.json("You successfully created an account!");
});

// Login
app.post("/login", async (req, res) => {
  let unparsedUserList = fs.readFileSync("users.json");
  let userList = JSON.parse(unparsedUserList);
  let userExist = userList.find((user) => {
    return user.username === req.body.name;
  });
  if (!userExist || !(await bcrypt.compare(req.body.pwd, userExist.password))) {
    // Don't run code if userExist is true
    res.json({ login: false });
    return;
  }

  if (req.session.id) {
    return res.json("You are already logged in");
  }

  // Create cookie-session
  req.session.id = uuid.v4();
  req.session.username = req.body.name;
  req.session.loginDate = new Date().toLocaleString();
  req.session.customerID = userExist.customerID;
  res.json({ login: true, name: req.body.name });
});

// Logout
app.delete("/logout", (req, res) => {
  req.session = null;
  res.json("You are now logged out!");
});

app.post("/payment", async (req, res) => {
  // Save body in variable
  let boughtCars = req.body;
  // Create empty array to put line_items in
  let carsToStripe = [];
  // Loop through body to create one line_item for every product
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

  // Save time and date for order
  let orderDate = new Date().toLocaleString();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: carsToStripe,
    mode: "payment",
    customer: req.session.customerID,
    metadata: {
      date: orderDate,
    },
    success_url: `http://localhost:3000/success.html`,
    cancel_url: "https://localhost:3000/cancel.html",
  });
  res.status(200).json({ id: session.id });
});

// Collect orders for specific users from verification.json
app.get("/orders", async (req, res) => {
  if (!req.session.id) {
    return res.json(false);
  }
  let userID = req.session.customerID;
  let unParsedOrderlist = fs.readFileSync("verification.json");
  let orderList = JSON.parse(unParsedOrderlist);
  const result = orderList.filter((order) => order.customerID === userID);
  res.json(result);
});

app.post("/verify", async (req, res) => {
  // Session id is sent in req.body
  const sessionID = req.body.sessionID;

  // We collect info about the session from stripe
  const paymentInfo = await stripe.checkout.sessions.retrieve(sessionID);

  // Check if order is paid
  if (paymentInfo.payment_status === "paid") {
    // Create an object containing order info to save in json-file
    let order = {
      orderId: paymentInfo.id,
      totalPrice: paymentInfo.amount_total,
      orderdProducts: paymentInfo.metadata,
      customerID: paymentInfo.customer,
    };
    // Get list of verified orders and parse it
    let unParsedOrderlist = fs.readFileSync("verification.json");
    let orderList = JSON.parse(unParsedOrderlist);

    // Check if order already exists
    let alreadyExist = orderList.find((orderItem) => {
      return orderItem.orderID === order.orderId;
    });
    if (alreadyExist) {
      // Don't run code if alreadyExists is true
      res.json("Order already exists");
      return;
    }
    // Save new order in json-file
    orderList.push(order);
    fs.writeFileSync("verification.json", JSON.stringify(orderList));

    res.json(true);
  }
});

app.listen(3000);
