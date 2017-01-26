const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const _ = require('lodash');

/*-----------------------------------------------------------------------------*/
/* 
 * User schema
 */ 

 var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true, // All emails must be unique
        validate: {
            validator: validator.isEmail, // validator library
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: true,
    },
    // Access tokens for individual users
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// Determines what a mongoose model returns when toJSON is called
// I am making sure that password and token is not returned to the user
UserSchema.methods.toJSON = function (){
    var user = this;
    var userObject = user.toObject(); // converts mongoose user into regular object

    return _.pick(userObject, ['_id', 'email']);
};

// Adding a method to the schema
UserSchema.methods.generateAuthToken = function() {
    var user = this; // accessing the doc that calls the method

    // specifying access and creating token
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    // pushing token into user object
    user.tokens.push({access,token});

    // saving user and returning so that server.js can use this in the chained promise
    return user.save().then(() => {
        return token;
    });
};

// Creating User model and associating UserSchema 
var User = mongoose.model('User', UserSchema);

module.exports = {User};