var {User} = require('./../models/users');
var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    User.findByToken(token).then((data) => {
        if(!data) {
            return Promise.reject();
        }
        req.data = data;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send({
            status:'error',
            message: 'Authorization is required'
            
        });
    });
};
module.exports = {authenticate};