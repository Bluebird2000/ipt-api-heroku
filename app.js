const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
var {User} = require('./models/users');
var {Product} = require('./models/products');
var {mongoose} = require('./db/mongoose');
var {ObjectID} = require('mongodb');
var {authenticate} = require('./middleware/authenticate');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/user', (req, res) => {
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

app.get('/users', (req, res) => {
    User.find().then((data) => {
        res.status(200).send({status: 'success', data});
    }, (e) => {
        res.status(400).send({status: 'error', e});
    });
});

app.get('/user/:id', (req, res) => {
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

app.put('/user/update/:id', (req, res) => {
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

app.put('/user/update/status/:id', (req, res) => {
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

app.delete('/user/:id', (req, res) => {
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


/* Ipt product endpoint starts here */
app.post('/product', (req, res) => {
    var createProduct = new Product({
        product_name: req.body.product_name,
        product_description: req.body.product_description,
        product_type: req.body.product_type,
        cost: req.body.cost,
        is_active:req.body.is_active,
        created_at:req.body.created_at,
        updated_at:req.body.updated_at
    });
    createProduct.save().then((data) => {
        res.status(200).send({status:'success', data});
    }).catch((e) => {
        res.status(400).send({status:'error', e});
    });
 });

 app.get('/products', (req, res) => {
    Product.find().then((data) => {
        res.status(200).send({status: 'success', data});
    }).catch((e) => {
        res.status(400).send({status: 'error', e});
    });
 });

 app.put('/product/update/:id', (req, res) => {
    let id = req.params.id;
    var body = _.pick(req.body, ['product_name', 'product_description', 'product_type', 'cost', 'created_at', 'updated_at']);
    if(!ObjectID.isValid(id)){
        return res.status(404).send('product not found');
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

app.get('/product/:id', (req, res) => {
    let id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send({
            err:'not found'
        });
    }
    Product.findById(id).then((data) => {
        if(!data){
            res.status(404).send('product not found');
        }
        res.status(200).send({
            status:'success',
            data
        });
    }, (e) => {
        res.status(400).send(e);
    });
});


app.put('/product/update/status/:id', (req, res) => {
    let id = req.params.id;
    var body = _.pick(req.body, ['status']);
    if(!ObjectID.isValid(id)){
        return res.status(404).send('product not found');
    }
    if(_.isBoolean(body.status) && body.status){
        body.status = true;
    }else{
        body.status = false;
    }
    Product.findByIdAndUpdate(id, {$set:body}, {new:true}).then((data) => {
        if(!data){
            res.status(404).send('product not found');
        }
        res.status(200).send({
            status:'success',
            data
        });
    }, (e) => {
        res.status(400).send(e);
    });
});

module.exports = {app};

app.listen(PORT, () => {
    console.log(`Application now listening to port ${PORT}`);
});