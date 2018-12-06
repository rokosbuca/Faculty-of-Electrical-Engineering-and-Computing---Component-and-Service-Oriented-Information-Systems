const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Status = new Schema({
    text: String,
    username: String
});

module.exports = mongoose.model('Status', Status);