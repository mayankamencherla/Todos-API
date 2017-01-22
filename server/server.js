    // Root of the project. Should run this to run the server
var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {ObjectID} = require('mongodb');

var app = express();

app.use(bodyParser.json()); // middleware for express

/*----------------------- All routes start----------------------------------*/
// Create a new todo and save
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

// Get all todos
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos}); // returning a todos object
    }, (e) => {
        res.status(400).send(e);
    });
});

// Get one todo by id
// req params contains the params passed into the request
app.get('/todos/:id', (req, res) => {

    var id = req.params.id; // getting the id from the dynamic url

    if (!ObjectID.isValid(id)){
        res.send(404).send();
    }

    Todo.findById(id).then((todo) => {
        res.send(todo);
    }, (e) => {
        res.send(400).send(e);
    });
});

/*----------------------- All routes end----------------------------------*/

app.listen(3000, () => {
  console.log('Started on port 3000');
});

// exporting app for tests
module.exports = {app};