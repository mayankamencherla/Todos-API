const {ObjectID} = require('mongodb');
const {Todo}     = require('./../../models/todo');
const {User}     = require('./../../models/user');
const jwt        = require('jsonwebtoken');

/*---------------------------Todos Seed Data------------------------*/

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
}];

const populateTodos  = (done) => {
    // wipe out all the data and add seed todos
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done()); 
};

/*---------------------------Todos Seed Data------------------------*/
/*---------------------------User Seed Data------------------------*/
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'mayank@example.com',
    password: 'abc123',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'cleo@example.com',
    password: '123abc',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()
    }]
}];

const populateUsers = (done) => {
    // remove all users in seed db and add test data
    User.remove({}).then(() => {
        // Doing it one by one so that UserSchema.pre('save') runs and pwd is hashed
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        // returning multiple promises 
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

/*---------------------------Todos Seed Data------------------------*/
module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
};