'use strict';

const ActionBuilder = require('@tuhi/engine/lib/actions/ActionBuilder');
const get = require('lodash/get');
const set = require('lodash/set');

module.exports = [
    ActionBuilder.General('set')
        .withDescription('Set a variable, only accessible without its own context.')
        .withExample('{set;example;Hello world!}{get;example}', 'Hello world!')
        .withArguments((f) => ([
            f.require('name'),
            f.require('value'),
        ]))
        .whenArguments(0, ActionBuilder.errors.notEnoughArguments)
        .whenArguments('1-2', (context, action) => {
            const name = action.children[0];
            const value = action.children[1];
            set(context.variables, name, value);
        })
        .whenDefault(ActionBuilder.errors.tooManyArguments)
        .build(),
    ActionBuilder.General('get')
        .withDescription('Get a variable, it will only be accessible without its own context.')
        .withExample('{set;example;Hello world!}{get;example}', 'Hello world!')
        .withArguments((f) => [f.require('name')])
        .whenArguments(0, ActionBuilder.errors.notEnoughArguments)
        .whenArguments(1, (context, action) => {
            const name = action.children[0];
            return get(context.variables, name);
        })
        .whenDefault(ActionBuilder.errors.tooManyArguments)
        .build(),
];