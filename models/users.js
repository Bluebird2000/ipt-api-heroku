const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    firstname: {
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    lastname: {
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    email: {
        type:String,
        required:true,
        unique:true,
        trim:true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        },
    },
    password: {
        type:String,
        required:true,
        minlength:6,
        default:Math.random().toString(36).substring(2, 15)
    },
    tokens: [{
        access: {
            type:String,
            required:true
        },
        token: {
            type:String,
            required:true
        }
    }],
    is_active: {
        type:Boolean,
        default:true
    },
    created_at: {
        type:Date,
        default: new Date(),
    },
    updated_at: {
        type:Date,
        default: null,
    },
});
UserSchema.methods.toJSON = function() {
    var createUser = this;
    var createUserObject = createUser.toObject();
    return _.pick(createUserObject, ['_id','password','firstname', 'lastname', 'email', 'is_active', 'created_at', 'updated_at']);
};
UserSchema.methods.generateAuthToken = function () {
    var createUser = this;
    var access = 'auth';
    var token = jwt.sign({_id: createUser._id.toHexString(), access}, 'photizzo').toString();
    createUser.tokens.push({access, token});
    return createUser.save().then(() => {
        return token;
    });
};
UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;
    try{
        decoded = jwt.verify(token, 'photizzo');
    }catch(e) {
        return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access':'auth'
    });
};
UserSchema.statics.findByCredentials = function(email, password){
    var User = this;
        return User.findOne({email}).then((data) => {
            if(!data){
                return Promise.reject();
            }
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, createUser.password, (err, res) => {
                    if(res){
                        resolve(data);
                    }else{
                        reject();
                    }
                });
            });
        });
};
UserSchema.pre('save', function(next) {
    var createUser = this;
    if(createUser.isModified('password')){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(createUser.password, salt, (err, hash) => {
                createUser.password = hash;
                next();
            });
        });

    }else{
        next();
    }
});
var User = mongoose.model('users', UserSchema);

module.exports = {User};