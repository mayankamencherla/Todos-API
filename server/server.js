// Root of the project. Should run this to run the server
var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/users');

var app = express();

app.listen(3000, () => {
    console.log('Started on port 3000');
});