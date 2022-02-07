'use strict';

const ActionBuilder = require('@tuhi/engine/lib/actions/ActionBuilder');
const REGEX = /(?:(?:^|[-+_*/])(?:\s*-?\d+(\.\d+)?(?:[eE][+-]?\d+)?\s*))+$/;

const MATH = Object.fromEntries(
    Object.getOwnPropertyNames(Math)
        .map(prop => [prop.toLowerCase(), Math[prop]]));

module.exports = [
    ActionBuilder.General('math')
        .withDescription('Work with many different mathematical functions.\n' +
            'Resemables JavaScripts native Math object.')
        .withExample(
            '10 * 5 + 25 = {math;10*5+25}, Round: {math;round;12.55}',
            '10 * 5 + 25 = 75, Round: 13'
        )
        .withArguments((f) => ([
            [f.selection(Object.keys(MATH)), f.require('equation', 'any')],
            f.optional('args...', 'number', true),
        ]))
        .whenArguments(0, ActionBuilder.errors.notEnoughArguments)
        .whenDefault((_, action) => {
            const method = action.children[0];
            if (!MATH[method]) {
                const expression = action.children[0];
                if (REGEX.test(expression)) return eval(expression);
                return ActionBuilder.errors.customError('Invalid method or equation');
            } else {
                if (typeof MATH[method] !== 'function') return MATH[method];
                const args = action.children.slice(1);
                const result = MATH[method](...args);
                if (args.length === 0 && isNaN(result))
                    return ActionBuilder.errors.notEnoughArguments;
                else if (isNaN(result)) return ActionBuilder.errors.invalidArgument;
                return result;
            }
        }).build()
];