    // Root of the project. Should run this to run the server
var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {ObjectID} = require('mongodb');

var app = express();
const port = process.env.PORT || 3000; // PORT if on production, 3000 locally

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

    // getting the id from the dynamic url
    var id = req.params.id; 

    if (!ObjectID.isValid(id)){
        return res.send(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo){
            return res.send(404).send();
        }
        
        res.send({todo});
    }, (e) => {
        res.send(400).send(e);
    });
});

/*----------------------- All routes end----------------------------------*/

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

// exporting app for tests
module.exports = {app};