const CONSTANTS = require("../constants.js");

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Chunk = new Schema({
    name: {
        type: String
    }
});

module.exports = Chunk;