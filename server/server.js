// Root of the project. Should run this to run the server

require('./config/config');

const express        = require('express');
const bodyParser     = require('body-parser');
const _              = require('lodash');

const {mongoose}     = require('./db/mongoose');
const {Todo}         = require('./models/todo');
const {User}         = require('./models/user');
const {ObjectID}     = require('mongodb');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT; // PORT if on production, 3000 locally

// used to make sure all req.body is a json 
app.use(bodyParser.json()); // middleware for express

/*----------------------- All todos routes start----------------------------------*/
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
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo){
            return res.status(404).send();
        }
        
        res.send({todo});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo){
            return res.status(404).send();
        }

        res.send({todo});
    }, (e) => {
        res.send(400).send(e);
    }).catch((e) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']); // user can update only these 2 properties

    if (!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    // updating completedAt based on completed boolean flag
    if (_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime(); // JavaScript timestamp
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    // new is returning a new obj and saving
    Todo.findByIdAndUpdate(id, {$set: body}, {new : true}).then((todo) => {
        if (!todo){
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    }); 
});

/*----------------------- All todos routes end----------------------------------*/
/*----------------------- All user routes start----------------------------------*/

// sign up a new user
app.post('/users', (req, res) => {
    // new user object
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then((usr) => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user); // custom header called auth
    }).catch((e) => {
        res.status(400).send(e);
    })
});

// private auth for user/me -> to get back the user
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user); // set in authenticate
});

// get all users signed up

/*----------------------- All user routes end----------------------------------*/

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

// exporting app for tests
module.exports = {app};