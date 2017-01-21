var mongoose = require('mongoose');

// Creating a model for the database called Todo
// 3 properties => text, completed and completedAt
var Todo = mongoose.model('Todo', {
    text: {
        type: String, // but numbers will pass 
        required: true,
        minlength: 1,
        trim: true // trims whitespace at the start and end of the string
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});

module.exports = {
    Todo
}