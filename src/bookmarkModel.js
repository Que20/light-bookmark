var mongoose = require('mongoose');

var bookmarkSchema = mongoose.Schema({
    owner: String,
    url: String,
    title: String,
    description: String,
    date: String
});

var Bookmark = module.exports = mongoose.model('Bookmark', bookmarkSchema, 'bookmarks');
// Todo : sort by date
module.exports.get = function (callback) {
    Bookmark.find().sort([['date', 'descending']]).all((posts) => {
        callback(posts)
    })
}