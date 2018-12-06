const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    username: String,
    password: String,
    saltId: String
});

module.exports = mongoose.model('User', User);