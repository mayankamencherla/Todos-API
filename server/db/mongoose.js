// Root of the project. Should run this to run the server

var mongoose = require('mongoose');

// mongoose syntax doesn't have a callback -> promise
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {
    mongoose
};