'use strict';

function stringifyArray(array) {
    return JSON.stringify(array);
}

function parseArray(string) {
    try {
        return JSON.parse(string);
    } catch (error) {
        if (string.startsWith('[') && string.endsWith(']'))
            string = string.slice(1, -1);
        return string.split(/,(?![^'"]*['"])/);
    }
}

module.exports = { stringifyArray, parseArray };