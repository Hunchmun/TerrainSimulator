var mongoose = require('mongoose');
var bluebird = require('bluebird');
var config = require("../config/mongo.json");

//Setup
mongoose.Promise = bluebird;
mongoose.connect(config.url);
mongoose.set('debug', config.debug);
module.exports = mongoose;