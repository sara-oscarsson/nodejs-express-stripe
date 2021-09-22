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
                unit_amount: boughtCar.car.price * 1,
            },
            quantity: boughtCar.quantity
        }
        carsToStripe.push(lineItem);
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: carsToStripe,
        mode: 'payment',
        success_url: `http://localhost:3000/success.html`,
        cancel_url: 'https://localhost:3000/cancel.html',
      });
      console.log(session.id)
     res.status(200).json({ id: session.id })
});

app.listen(3000);