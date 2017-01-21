    // Root of the project. Should run this to run the server
var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json()); // middleware for express

/*----------------------- All routes ----------------------------------*/
app.post('/todos', (req, res) => {

    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});


app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos}); // returning a todos : {}
    }, (e) => {
        res.status(400).send(e);
    });
});

/*----------------------- All routes ----------------------------------*/

app.listen(3000, () => {
  console.log('Started on port 3000');
});

// exporting app for tests
module.exports = {app};