const { response } = require('express');
const express = require('express');
const app = express();
const fs = require('fs');
const uuid = require('uuid');

const env = require('dotenv').config('.env');

//Collect secret api key from .env file
const secretKey = process.env.STRIPE_SECRET_KEY;
//Connect that key to stripe?
const stripe = require('stripe')(secretKey);

app.use(express.static('public'));
app.use(express.json());

app.post('/payment', async (req, res) => {
    //Save body in variable
    let boughtCars = req.body;
    //Create empty array to put line_items in
    let carsToStripe = [];
    //Loop through body to create one line_item for every product 
    boughtCars.forEach(boughtCar => {
        let lineItem = {
            description: boughtCar.car.description,
            price_data: {
                currency: 'sek',
                product_data: {
                    name: boughtCar.car.model
                },
                unit_amount: boughtCar.car.price * 100,
            },
            quantity: boughtCar.quantity
        }
        carsToStripe.push(lineItem);
    });

    //Save time and date for order
    let orderDate = new Date().toLocaleString();
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: carsToStripe,
        mode: 'payment',
        metadata: {
            date: orderDate
        },
        success_url: `http://localhost:3000/success.html`,
        cancel_url: 'https://localhost:3000/cancel.html',
      });
     res.status(200).json({ id: session.id });
});

app.post("/verify", async (req, res) => {
    //Session id is sent in req.body
    const sessionID = req.body.sessionID

    //We collect info about the session from stripe
    const paymentInfo = await stripe.checkout.sessions.retrieve(sessionID);

    //Check if order is paid
    if(paymentInfo.payment_status === "paid") {
        //Create an object containing order info to save in json-file
        let order = {
            orderId: paymentInfo.id,
            totalPrice: paymentInfo.amount_total,
            orderdProducts: paymentInfo.metadata
        }
        //Get list of verified orders and parse it
        let unParsedOrderlist = fs.readFileSync('verification.json');
        let orderList = JSON.parse(unParsedOrderlist);

        //Check if order already exists
        let alreadyExist = orderList.find(orderItem => {
            return orderItem.orderID === order.orderId;
        })
        if(alreadyExist) {
            //Don't run code if alreadyExists is true
            res.json('Order already exists')
            return
        }
        //Save new order in json-file
        orderList.push(order)
        fs.writeFileSync('verification.json', JSON.stringify(orderList))

        res.json(true);
    }
})

app.listen(3000);