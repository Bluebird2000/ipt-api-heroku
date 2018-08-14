const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var ProductSchema = new mongoose.Schema({
    product_name: {
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    product_description: {
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    product_type: {
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    cost: {
        type:String,
        required:true,
        minlength:3
    },
    status: {
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
ProductSchema.methods.toJSON = function() {
    var createProduct = this;
    var createProductObject = createProduct.toObject();
    return _.pick(createProductObject, ['_id','product_name','product_description', 'product_type', 'cost', 'status', 'created_at', 'updated_at']);
};

var Product = mongoose.model('products', ProductSchema);

module.exports = {Product};