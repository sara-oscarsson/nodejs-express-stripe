const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/payment', (req, res) => {
    console.log(req.body)
    res.json('test');
});

app.listen(3000);