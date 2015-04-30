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

db.open(function (err) {
    if (err) {
        console.error(err);
    } else {
        startServer();
    }
});

function startServer() {
    app.get('/', function (req, res) {
        res.render('index.jade');
    });

    app.get('/words/:id?', function (req, res, next) {
        var regExp;
        var findObj = {};
        var fieldObj = {_id: 1};
        // searched word. Could be with *-symbol, then use regexp with .* instead of *
        if (req.params.id) {
            regExp = new RegExp("^" + req.params.id.replace(/\*/gi, '.*') + "$");
            findObj._id = regExp;
        }

        // if url like /words/blah?links=true, then fetch links too
        if (req.query.links) {
            fieldObj.links = 1;
        }

        db.collection('words').find(findObj, fieldObj).sort({"_id": 1}).toArray(function (err, result) {
            if (err) return next(err);
            res.send(result);
        });
    });

    app.get('/sentences/:id', function (req, res, next) {
        db.collection('sentences').find({"_id": parseInt(req.params.id, 10)}).toArray(function (err, result) {
            if (err) return next(err);
            res.send(result);
        });
    });

    app.use(express.static(__dirname + '/public'));

    // not found
    app.use(function (req, res, next) {
        res.status(404).send("Not found");
    });

    //internal server error
    app.use(function (err, req, res, next) {
        console.error(err);
        console.error("Request was: " + req);
        res.status(500).send(err);
    });

    app.listen(8080, function () {
        console.info("Server started at 8080 port");
    });
}