const mqtt = require('mqtt');
const client = mqtt.connect(require("../config/mqtt.json"));
module.exports = client;