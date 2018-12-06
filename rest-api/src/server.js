// connect to mongodb
const mongoose   = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017');

const User = require('../database/models/user');
const user = new User();
user.username = 'Sandro';
user.password = 'qc7k3upc';
user.saltId = 'saltidididi';

user.save((err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('user saved ->', user);
    User.find((err, users) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('users actually found ->', users);
    });
});

// setting up express server
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