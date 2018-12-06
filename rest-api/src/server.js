const config = require('./config');

// connect to mongodb
const mongoose   = require('mongoose');
mongoose.connect(config.database);

// setting up express server
const express = require('express');
const bodyParser = require('body-parser');

// create and setup express app
const app = express();
app.set('restSecret', config.secret);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || config.PORT;

// initialize rest api controller
const restApiController = require('./api/routes')(app, '/api');

app.listen(PORT);
console.log('Server listening at port', PORT);