var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: String,
    password: String
});

var User = module.exports = mongoose.model('User', userSchema, 'user');
module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}