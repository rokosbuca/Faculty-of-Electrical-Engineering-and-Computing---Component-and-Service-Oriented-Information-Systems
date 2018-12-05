const express = require('express');
const bodyParser = require('body-parser');

// create and setup express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

// initialize rest api controller
const restApiController = require('./api/routes')(app, '/api');

app.listen(PORT);
console.log('Server listening at port', PORT);