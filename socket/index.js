const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require("path");

const client = require("../interfaces/mqtt.js");

client.on('connect', function () {
    console.log("Connected to MQTT");
    client.subscribe('chunk_updates', function (err) {
        console.error(err);
    });
});

client.on('message', function (topic, buffer) {
    for (let i in clients) {
        if (clients.hasOwnProperty(i)) {
            clients[i].emit(topic, buffer.toString());
        }
    }
});

server.listen(3001);
app.use(express.static(path.join(__dirname, '../frontend')));

const clients = {};

io.on('connection', function (socket) {
    socket.on('disconnect', function () {
        delete clients[socket.id];
    });
});