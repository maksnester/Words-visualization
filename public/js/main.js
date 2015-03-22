'use strict';

var ajaxLoader = document.createElement('div');
ajaxLoader.className = 'ajaxLoader';

var loaders = {
    "words": ajaxLoader,
    "primary-links": ajaxLoader.cloneNode(),
    "secondary-links": ajaxLoader.cloneNode()
};

var WORDS = 'words';
var PRIMARY_LINKS = 'primary-links';
var SECONDARY_LINKS = 'secondary-links';

var containers;

$(document).on('ready', function () {
    containers =  {
        "words": $("#" + WORDS),
        "primary-links": $('#' + PRIMARY_LINKS),
        "secondary-links": $('#' + SECONDARY_LINKS)
    };
});

function getWords() {
    var wordsUrl = "words";
    var searched = $('#search > input')[0].value;
    if (searched) {
        searched = searched.trim();
        if (searched.length > 0) wordsUrl = searched;
    }
    showLoader(WORDS);
    $.ajax({
        url: window.location.href + wordsUrl,
        method: "get",
        success: function (jqXHR) {
            hideLoader(WORDS, function() {
                containers[WORDS].append(convertWordsListToStr(jqXHR));
            });
        },
        error: function (jqXHR, error) {
            console.error(error);
            hideLoader(WORDS);
        }
    })
}

/**
 * @param name - имя лоадера и контейнера
 * @param callback - функция вызываемая после показа
 */
function showLoader(name, callback) {
    containers[name].append(loaders[name]);
    if (typeof(callback) === "function") {
        callback();
    }
}

/**
 * @param name - имя лоадера и контейнера
 * @param callback - функция вызываемая после сокрытия
 */
function hideLoader(name, callback) {
    setTimeout(function() {
        loaders[name].remove();
        if (typeof(callback) === "function") {
            callback();
        }
    }, 1000);
}

function convertWordsListToStr(array) {
    var arrayOfWords = [];
    for (var i = 0; i < array.length; i++) {
        arrayOfWords[arrayOfWords.length] = array[i]._id;
    }
    return ('<li>' + arrayOfWords.join('</li><li>') + '</li>');
}
//TODO search $("window").scrollTop($("*:contains('search text here'):eq(n)").offset().top); n - nth mathc