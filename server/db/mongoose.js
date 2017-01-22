// Root of the project. Should run this to run the server

var mongoose = require('mongoose');

// mongoose syntax doesn't have a callback -> promise
mongoose.Promise = global.Promise;
// heroku mongodb or localhost used based on environment
mongoose.connect(process.env.MONGODB_URI);

module.exports = {
    mongoose
};

// Setting up environments
process.env.NODE_ENV === 'production';