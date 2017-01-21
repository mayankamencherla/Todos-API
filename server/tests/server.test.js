const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// run before each test case (independent of other test cases)
beforeEach((done) => {
    Todo.remove({}).then(() => done()); // wipe out all the data
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

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1); // we have added 1 todo only
                    expect(todos[0].text).toBe(text); // asserting that the text is the same
                    done();
                }).catch((e) => done(e)); // catching errors
            });
    });

    it('should not create a new todo', (done) => {
        var text = '';

        request(app)
            .post('/todos')
            .send({text})
            .expect(400) // status
            .end((err, res) => {
                if (err){
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(0); // no todo should be created
                    done();
                }).catch((e) => done(e)); // catch error
            });
    });
})