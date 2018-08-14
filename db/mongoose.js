const mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/ipt');
mongoose.connect('mongodb://Bluebird2000:default111@ds119572.mlab.com:19572/ipt-api');

mongoose.Promise = global.Promise;

module.exports = {mongoose};