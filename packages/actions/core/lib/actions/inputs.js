'use strict';

const ActionBuilder = require('@tuhi/engine/lib/actions/ActionBuilder');

module.exports = [
    ActionBuilder.Simple('inputs')
        .withDescription('Inputs from the user.')
        .withExample(
            'Your first word was {inputs;0}!',
            'Hello world',
            'Your first word was Hello!',
        )
        .withArguments((f) => ([
            f.optional('index', 'number'),
            f.optional('range', 'number', true),
        ]))
        .whenArguments(0, (context) => JSON.stringify(context.inputs))
        .whenArguments(1, (context, action) => {
            const index = parseInt(action.children[0]);
            if (isNaN(index)) return ActionBuilder.errors.notANumber;
            return context.inputs[index];
        })
        .whenArguments(2, (context, action) => {
            const indexes = action.children.map(child => parseInt(child));
            if (indexes.some(isNaN)) return ActionBuilder.errors.notANumber;
            return context.inputs.slice(indexes[0], indexes[1]);
        })
        .whenDefault(ActionBuilder.errors.tooManyArguments)
        .build()
];