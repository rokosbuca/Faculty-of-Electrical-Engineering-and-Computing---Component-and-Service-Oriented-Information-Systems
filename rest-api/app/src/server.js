const express = require('express');
const bodyParser = require('body-parser');

// create and setup express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.listen(PORT);
console.log('Server listening at port', PORT);