const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    text: 'First test todo'
}, {
    text: 'Second test todo'
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
