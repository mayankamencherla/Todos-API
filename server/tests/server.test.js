const expect                 = require('expect');
const request                = require('supertest');
const {app}                  = require('./../server');
const {Todo}                 = require('./../models/todo');
const {User}                 = require('./../models/user');
const {ObjectID}             = require('mongodb');
const _                      = require('lodash');
const {todos, populateTodos} = require('./seed/seed');
const {users, populateUsers} = require('./seed/seed');

// run before each test case (independent of other test cases)
beforeEach(populateTodos);
beforeEach(populateUsers);

// testing /todos
describe('POST /todos', () => {
    // mocha test case -> verify todo gets created
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200) //status
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err){
                    return done(err);
                }

                // 2 objects already in the db
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(3); // we have added 1 todo only
                    expect(todos[2].text).toBe(text); // asserting that the text is the same
                    done();
                }).catch((e) => done(e)); // catching errors
            });
    });

    it('should not create a new todo', (done) => {

        request(app)
            .post('/todos')
            .send({})
            .expect(400) // status
            .end((err, res) => {
                if (err){
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2); // no todo should be created
                    done();
                }).catch((e) => done(e)); // catch error
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        // testing for 2 objects in the database after seeding
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2); // todos.length because this route returns todos : {}
            })
            .end(done);
    });
});

// should test 404, success and 400
describe('GET /todos/:id', () => {
    it('should get one todo', (done) => {
        // testing getting a single todo object
        // Passing in id of first todos seed object
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return a 404 not found for object id', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });

    it('should return a 404 not found for non-object id', (done) => {
        request(app)
            .get('/todos/123abc')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete a given todo', (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err){
                    return done(err);
                }

                Todo.findById(res.body.todo._id).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e)); 
            });
    });

    // Creating a new object -> that doesn't exist
    it('should 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });

    // Invalid object ID
    it('should return 404 if object id is invalid', (done) => {
        request(app)
            .get('/todos/123abc')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update a given todo', (done) => {
        var hexId = todos[0]._id.toHexString();

        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text: 'Something to do',
                completed: true,
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe('Something to do');
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text: 'Something to do!!',
                completed: false,
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe('Something to do!!');
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
    });
});
/*----------------------------------User tests---------------------------------*/

describe('POST /users', () =>{
    it('should create a new user', (done) => {
        var email = 'example@example.com';
        var password = 'abc124';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err, res) => {
                if (err){
                    return done(err);
                }

                // asserting doc in db
                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation error when request is invalid', (done) =>{
        var email = 'example@example';
        var password = 'abs';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) =>{
        // Sending in users[0] because only 2 users in db before each test
        request(app)
            .post('/users')
            .send({
                email: users[0].email, 
                password: users[0].password
            })
            .expect(400) 
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return a new user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    }); 

    it('should return a 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401) // unauthorized
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users/login', () => {
    // check for already signed up user in db
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[0].email,
                password: users[0].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err){
                    return done(err);
                }

                // check that x-auth token was pushed into the tokens array in db
                User.findById(users[0]._id).then((user) => {
                    // index 1 because new token is pushed
                    expect(user.tokens[1]).toInclude({ 
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should reject invalid login', (done) => {
        var email = 'example@example.com';
        var password = 'abc123';

        request(app)
            .post('users/login')
            .send({email, password})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if (err){
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    // index 1 because new token is pushed
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});