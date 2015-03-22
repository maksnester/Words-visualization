'use strict';

var express = require('express');
var app = express();
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');

var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {"auto-reconnect": true});
var db = new mongodb.Db('idb', server, {safe: false});

var words;
var sentences;

db.open(function(err){
    if (err) console.error(err);
    startServer();
});

function startServer() {
    app.get('/', function (req, res, next) {
        res.render('index.jade');
    });

    app.use(express.static(__dirname + '/public'));

    app.use(function (req, res, next) {
        res.status(404).send("Not found");
    });

    app.use(function (err, req, res, next) {
        console.error(err);
        console.error("Request was: " + req);
        res.status(500).send(err);
    });

    app.listen(8080, function () {
        console.info("Server started");
    });
}