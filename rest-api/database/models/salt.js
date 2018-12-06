const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Salt = new Schema({
    saltId: String,
    salt: String
});

module.exports = mongoose.model('Salt', Salt);