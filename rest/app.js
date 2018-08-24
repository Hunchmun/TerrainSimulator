const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const path = require("path");
const favicon = require('serve-favicon');

//Logger
const Jethro = require('jethro');
const logger = require('../interfaces/jethro.js');
const expressLog = new Jethro.Express();
logger.addPlugin('express', expressLog);

const app = express();

// Static
app.use(express.static(path.join(__dirname, '../frontend')));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//Server
app.set('json spaces', 4);
app.use(expressLog.input());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use(require('./routes/index.js'));

app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.statusCode = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    setTimeout(function() {
        if (req.body) {
            console.log(req.body);
        }
        console.error(err)
    }, 50);
    res.status(err.statusCode || 500).json({
        message: err.message,
        code: err.statusCode,
        stack: err.stack.split("\n")
    });
});


module.exports = app;