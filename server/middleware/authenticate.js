const {User} = require('./../models/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth'); // x-auth token
    // finds the user by the token
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        req.user = user;
        req.token = token; // can be accessible be route that calls this function

        // next is key to continue with the process
        next();
    }).catch((e) => {
        res.status(401).send(); // 401 = unauthorized
    }); 
};

module.exports = {authenticate};