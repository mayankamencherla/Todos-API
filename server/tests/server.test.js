const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {ObjectID} = require('mongodb');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
}]

// run before each test case (independent of other test cases)
beforeEach((done) => {
    // wipe out all the data and add seed todos
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done()); 
});

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
});
