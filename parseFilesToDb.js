'use strict';
var startTime = Date.now();
var endTime;

var sourceDir = "D:\\Учеба\\типо Распределенные системы\\lab1\\";

var config = {
    book1: sourceDir + 'Brealey R. - Principles of Corporate Finance (10th Edition) - 2010.txt',
    book2: sourceDir + 'Kotler, Keller - Marketing Management (14th Edition).txt',
    dictionary: sourceDir + 'Kotler Terms.csv',
    nounsDictionary: sourceDir + 'nounlist.txt'
};

var fs = require('fs');
var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {auto_reconnect: true});
var db = new mongodb.Db('idb', server, {safe: false}); // получаем БД по имени idb

db.open(function(err, db) {
    if (err) throw err;
    var data = fs.readFileSync(config.dictionary);

    //только термины до запятой или открывающейся скобки - без пояснений и расшифровок
    var dictionary = data.toString().match(/^[A-z’\-\s]{3,}\s*[(,]/gm);
    var i = dictionary.length;
    while (i--) {
        dictionary[i] = dictionary[i].replace(',','');
        dictionary[i] = dictionary[i].replace(' (','');
    }

    data = fs.readFileSync(config.nounsDictionary);
    var nouns = data.toString().match(/[A-z\-']+/g);

    dictionary = union_arrays(dictionary, nouns);

    // словарь сформирован

    // парсим книги
    var firstBookResults = parseBook(config.book1);
    var secondBookResults = parseBook(config.book2);

    //соединям слова и предложения с обоих книг в одну кучу
    var words = union_arrays(firstBookResults.words, secondBookResults.words);
    var sentences = union_arrays(firstBookResults.sentences, secondBookResults.sentences);

    console.log("Go to slice cycle.");

    //оставляем только те слова, которые есть в словаре
    for (var i = 0; i < words.length; i++) {
        var ind = dictionary.indexOf(words[i]);
        if (ind === -1) {
            words.splice(i, 1); // удаляем слово, т.к. его нет в словаре
        }
    }

    console.log("End slice cycle.");

    // трансформируем строки в объекты для монги
    // в качестве _id оставляем само слово, т.к. оно уникально
    //внутри каждого слова сохраняем на какие слова оно ссылается и в каком предложении
    //это массив объектов links: [{_word, _sentence}]
    var finalWords = [];
    i = words.length;
    while (i--){
        finalWords[i] = {_id: words[i], links: []};
    }

    console.log("Start final cycle.");
    //аналогично для предложений, но тут в качестве ключа используем просто индекс предложения
    i = sentences.length;
    while (i--) {
        var foundWords = sentences[i].match(/([A-z'-]{3,}\b)(?!.*\1\b)/g);
        sentences[i] = {"_id": i, "text": sentences[i]};

        //для каждого слова из текущего предложения проверяем, что это слово есть в words
        //если оно есть, то в links к нему добавляем все прочие найденные слова
        if (foundWords) {
            foundWords.forEach(function (elem, index) {
                var indexInWords = words.indexOf(elem);
                if (indexInWords > -1) {
                    for (var k = 0; k < foundWords.length; k++) {
                        // само к себе слово не учитывается
                        if (k !== index) {
                            finalWords[indexInWords].links.push({
                                "_word" : foundWords[k],
                                "_sentence" : i
                            });
                        }
                    }
                }
            });
        }
    }

    console.log("End final cycle.");

    var sync = 2;

    db.collection('words').insert(finalWords, function(err, result) {
        if (err) console.log(err);
        console.log('done words');

        db.collection('sentences').insert(sentences, function(err, result) {
            if (err) console.log(err);
            console.log('done sentences');
            db.close();
            endTime = new Date(Date.now() - startTime);
            console.log("Execution time: " + endTime.getMinutes() + "m " + endTime.getSeconds() + "s.");
            process.exit();
        });
    });


});

/**
 * Сливает два массива в один без дупликатов
 * @param x
 * @param y
 * @returns {Array}
 */
function union_arrays (x, y) {
    var obj = {};
    for (var i = x.length-1; i >= 0; -- i)
        obj[x[i]] = x[i];
    for (var i = y.length-1; i >= 0; -- i)
        obj[y[i]] = y[i];
    var res = [];
    for (var k in obj) {
        if (obj.hasOwnProperty(k))  // <-- optional
            res.push(obj[k]);
    }
    return res;
}

function parseBook(book) {
    var data = fs.readFileSync(config.book1); // читаем первую книгу

    var sentences = data.toString().match(/[A-Z]+([^\.!\?]){8,}[\.!\?]+/g);
    var words = data.toString().match(/[A-z'-]{3,}/g);

    return {"sentences": sentences, "words": words};
}