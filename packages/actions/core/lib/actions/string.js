'use strict';

const ActionBuilder = require('@tuhi/engine/lib/actions/ActionBuilder');
const _ = require('lodash/string');

const METHODS = {
    length: (str) => str.length,
    split: (str, ...args) => str.split(...args),
    indexof: (str, ...args) => str.indexOf(...args),
    lastindexof: (str, ...args) => str.lastIndexOf(...args),
    trim: (str) => str.trim(),
    trimend: (str) => str.trimEnd(),
    trimstart: (str) => str.trimStart(),
    substring: (str, ...args) => str.substring(...args),
    startswith: (str, ...args) => str.startsWith(...args),
    endswith: (str, ...args) => str.endsWith(...args),
    replace: (str, ...args) => str.replaceAll(...args),
    uppercase: (str) => str.toUpperCase(),
    lowercase: (str) => str.toLowerCase(),
    camelcase: (str) => _.camelCase(str),
    kebabcase: (str) => _.kebabCase(str),
    snakecase: (str) => _.snakeCase(str),
    titlecase: (str) => _.startCase(str),
    firstcase: (str) => _.capitalize(str),
    words: (str) => _.words(str),
    clean: (str) => str.replace(/\s+/g, (m) => m.indexOf('\n') !== -1 ?
        '\n' : m.indexOf('\t') !== -1 ?
            '\t' : m.substr(0, 1)),
};

module.exports = [
    ActionBuilder.General('string')
        .withDescription('String manipulation.')
        .withExample('{string;Hello world;length}', '12')
        .withArguments((f) => [
            f.require('string'),
            f.selection(Object.keys(METHODS)),
        ])
        .whenArguments(0, ActionBuilder.errors.notEnoughArguments)
        .whenDefault((_, action) => {
            const string = action.children[0];
            const method = action.children[1];
            const args = action.children.slice(2);
            if (!method) return string;
            if (!METHODS[method]) return ActionBuilder.errors.invalidArgument;
            return METHODS[method](string, ...args);
        }).build(),
];
