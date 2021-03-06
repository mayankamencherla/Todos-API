const mongoose  = require('mongoose');
const jwt       = require('jsonwebtoken');
const validator = require('validator');
const _         = require('lodash');
const bcrypt    = require('bcryptjs');

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
        minlength: 6,
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
UserSchema.methods.generateAuthToken = function (){
    var user = this; // accessing the doc that calls the method

    // specifying access and creating token
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    // pushing token into user object
    user.tokens.push({access, token});

    // saving user and returning so that server.js can use this in the chained promise
    // user is returned as res, but token is latched on to promise
    return user.save().then(() => {
        return token;
    });
};

// Find user by token -> Using statics
UserSchema.statics.findByToken = function (token){
    var User = this; // model method, so this = User
    var decoded;

    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject(); // returning a reject promise if jwt.verify fails
    }

    // syntax to get a property in an array (when there is a dot in the value)
    // Can be used otherwise as well, returning a promise
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token, 
        'tokens.access': 'auth'
    });
};

// model method
UserSchema.statics.findByCredentials = function(email, password){
    var User = this;

    return User.findOne({email}).then((user) => {
        if (!user){
            return Promise.reject(); // will trigger promise reject
        }

        // bcrypt compare uses callbacks
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res){
                    resolve(user); // sending user as a resolve
                } else{
                    reject();
                }
            });
        });
    });
};

// instance method -> remove token from array using $pull
UserSchema.methods.removeToken = function(token){
    var user = this;

    // pull out token from tokens array
    // return for a chained promise
    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

// Adding a save event before we save the doc to the database
// Need next , and need to call it inside the function
UserSchema.pre('save', function (next){
    var user = this;

    // returns true if password is modified
    if (user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) =>{
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash; 
                next();
            });
        });
    } else {
        next();
    }
});

// Creating User model and associating UserSchema 
var User = mongoose.model('User', UserSchema);

module.exports = {User};