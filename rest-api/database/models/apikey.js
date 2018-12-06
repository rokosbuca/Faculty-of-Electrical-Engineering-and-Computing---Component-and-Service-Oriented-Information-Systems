const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApiKey = new Schema({
    key: String,
    revoked: Boolean,
    username: String
});

module.exports = mongoose.model('ApiKey', ApiKey);