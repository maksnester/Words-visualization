'use strict';

var WORDS = 'words';
var PRIMARY_LINKS = 'primary-links';
var SECONDARY_LINKS = 'secondary-links';

var containers;
var loaders;

$(document).on('ready', function () {
    containers =  {
        "words": $("#" + WORDS),
        "primary-links": $('#' + PRIMARY_LINKS),
        "secondary-links": $('#' + SECONDARY_LINKS)
    };

    createAjaxLoaders();
    addSearchEnterListener();
    addWordsClickListeners();
});

function getWords() {
    clearContainers();
    var searched = $('#search > input')[0].value;
    if (searched) {
        searched = searched.trim();
        if (searched.length < 1) searched = "";
    }
    showLoader(WORDS);
    $.ajax({
        url: window.location.href + "words/" + searched,
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

function showPrimaryLinks(word) {
    alert("ajax to primary links with word " + word);
}

function showSecondaryLinks(word) {
    alert("ajax to secondary links with word " + word);
}

function addWordsClickListeners() {
    containers[WORDS].on('click', '> li', function () {
        showPrimaryLinks(this.textContent || this.innerText);
    });
    containers[PRIMARY_LINKS].on('click', '> li', function () {
        showSecondaryLinks(this.textContent || this.innerText);
    });
}

function clearContainers() {
    for (var c in containers) {
        if (containers.hasOwnProperty(c)) {
            containers[c].empty();
        }
    }
}

function addSearchEnterListener() {
    var searchInput = document.querySelector('#search > input');
    searchInput.onkeydown = function (event) {
        var keyCode = event.which || event.keyCode;
        //enter button
        if (keyCode === 13) {
            getWords();
        }
    }
}

function createAjaxLoaders() {
    var ajaxLoader = document.createElement('div');
    ajaxLoader.className = 'ajaxLoader';

    loaders = {
        "words": ajaxLoader,
        "primary-links": ajaxLoader.cloneNode(),
        "secondary-links": ajaxLoader.cloneNode()
    };
}