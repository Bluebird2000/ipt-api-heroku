const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
var {User} = require('./models/users');
var {mongoose} = require('./db/mongoose');
var {ObjectID} = require('mongodb');
var {authenticate} = require('./middleware/authenticate');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/create/user', (req, res) => {
   var createUser = new User({
       firstname:req.body.firstname,
       lastname:req.body.lastname,
       email:req.body.email,
       password:req.body.password,
       is_active:req.body.is_active,
       created_at:req.body.created_at,
       updated_at:req.body.updated_at
   });
   createUser.save().then(() => {
       return createUser.generateAuthToken();
   }).then((token) => {
       res.header('x-auth', token).status(200).send(createUser);
   }).catch((e) => {
       res.status(400).send(e);
   });
});

app.get('/users', authenticate, (req, res) => {
    User.find().then((data) => {
        res.status(200).send(req.data);
    });
    
});

app.get('/users/:id', (req, res) => {
    let id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send({
            err:'not found'
        });
    }
    User.findById(id).then((data) => {
        if(!data){
            res.status(404).send('user not found');
        }
        res.status(200).send({
            status:'success',
            data
        });
    }, (e) => {
        res.status(400).send(e);
    });
});

app.patch('/users/update/:id', (req, res) => {
    let id = req.params.id;
    var body = _.pick(req.body, ['firstname', 'lastname', 'email', 'password', 'created_at', 'updated_at']);
    if(!ObjectID.isValid(id)){
        return res.status(404).send('user not found');
    }
    body.updated_at = new Date().getTime();
    User.findByIdAndUpdate(id, {$set:body}, {new:true}).then((data) => {
        if(!data){
            res.status(404).send('data not found');
        }
        res.status(200).send({
            status:'success',
            data
        });
    }, (e) => {
        res.status(400).send(e);
    });
});

app.patch('/users/update/status/:id', (req, res) => {
    let id = req.params.id;
    var body = _.pick(req.body, ['is_active']);
    if(!ObjectID.isValid(id)){
        return res.status(404).send('user not found');
    }
    if(_.isBoolean(body.is_active) && body.is_active){
        body.is_active = true;
    }else{
        body.is_ative = false;
    }
    User.findByIdAndUpdate(id, {$set:body}, {new:true}).then((data) => {
        if(!data){
            res.status(404).send('user not found');
        }
        res.status(200).send({
            status:'success',
            data
        });
    }, (e) => {
        res.status(400).send(e);
    });
});

app.delete('/users/delete/:id', (req, res) => {
    let id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send('unable to process request');
    }
    User.findByIdAndRemove(id).then((data) => {
        if(!data){
            res.status(404).send('user not found');
        }
        res.status(200).send({
            status:'success',
            data
        });
    }, (e) => {
        res.status(400).send(e);
    });
});

app.post('/user/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((data) => {
        res.status(200).send({
            status:'success',
            data
        });
    }).catch((e) => {
        res.status(400).send();
    });
});
module.exports = {app};

app.listen(PORT, () => {
    console.log(`Application now listening to port ${PORT}`);
});