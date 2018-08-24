const mongoose = require("../interfaces/mongoose.js");

module.exports = {
    CONSTANTS: require("./constants.js"),
    Chunk: mongoose.model("Chunk", require("./models/Activity/Activity.js"))
};