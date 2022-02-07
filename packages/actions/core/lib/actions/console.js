'use strict';

const ActionBuilder = require('@tuhi/engine/lib/actions/ActionBuilder');

const METHODS = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    clear: console.clear,
};

module.exports = [
    ActionBuilder.General('console')
        .withDescription('Logging to the console.\n' +
            'Resemables JavaScripts native console object.')
        .withExample('{console;log;Hello world}', '')
        .withArguments((f) => ([
            f.selection(Object.keys(METHODS)),
            f.optional('args', 'any', true),
        ]))
        .whenArguments(0, ActionBuilder.errors.notEnoughArguments)
        .whenDefault((context, action) => {
            const method = action.children[0];
            if (!METHODS[method]) return ActionBuilder.errors.invalidArgument;
            const args = action.children.slice(1);
            const suppressConsole = context.options.suppressConsole;
            if (!suppressConsole) METHODS[method](...args);
        }).build(),
];
