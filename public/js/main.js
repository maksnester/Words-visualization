'use strict';

var WORDS = 'words';
var PRIMARY_LINKS = 'primary-links';
var SECONDARY_LINKS = 'secondary-links';

var containers;
var loaders;
var currentWord;

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
                containers[WORDS].append(convertArrayToList(jqXHR, "_id"));
            });
        },
        error: function (jqXHR, error) {
            console.error(error);
            hideLoader(WORDS);
        }
    })
}

function showPrimaryLinks(word) {
    clearContainers([PRIMARY_LINKS, SECONDARY_LINKS]);
    fillContainerWithLinks(word, PRIMARY_LINKS);
}

function showSecondaryLinks(word) {
    clearContainers(SECONDARY_LINKS);
    fillContainerWithLinks(word, SECONDARY_LINKS);
}

function fillContainerWithLinks(word, container) {
    showLoader(container);
    $.ajax({
        url: window.location.href + "words/" + word + "?links=true",
        method: 'get',
        success: function(jqXHR) {
            // object copy
            if (container === PRIMARY_LINKS) currentWord = $.extend(true, {}, jqXHR);

            if (jqXHR[0] && jqXHR[0].links) {
                hideLoader(container, function() {
                    containers[container].append(convertArrayToList(jqXHR[0].links, "_word"));
                });
            }
        },
        error: function(jqXHR, error) {
            console.error(error);
            hideLoader(container);
        }
    });
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

/**
 * Converts field from elements of array to string with li-nodes
 * @param array
 * @param field
 * @returns {string}
 */
function convertArrayToList(array, field) {
    var arrayOfWords = [];
    for (var i = 0; i < array.length; i++) {
        arrayOfWords[arrayOfWords.length] = array[i][field];
    }
    return ('<li>' + arrayOfWords.join('</li><li>') + '</li>');
}

function addWordsClickListeners() {
    containers[WORDS].on('click', '> li', function () {
        showPrimaryLinks(this.textContent || this.innerText);
    });
    containers[PRIMARY_LINKS].on('click', '> li', function () {
        showSecondaryLinks(this.textContent || this.innerText);
    });
}

/**
 * Clear specified or all containers
 * @param array (optional)
 */
function clearContainers(array) {
    var singleClear = function() {
        containers[array].empty();
    };

    var specificClear = function() {
        //array.forEach(function(elem) {
        //    containers[elem].empty();
        //});
        for (var c in array) {
            if (array.hasOwnProperty(c)) {
                containers[array[c]].empty();
            }
        }
    };

    var allClear = function() {
        for (var c in containers) {
            if (containers.hasOwnProperty(c)) {
                containers[c].empty();
            }
        }
    };

    switch (typeof(array)) {
        case "string" :
            singleClear();
            break;
        case "object" :
            specificClear();
            break;
        case "undefined":
            allClear();
            break;
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