'use strict';

const ActionBuilder = require('@tuhi/engine/lib/actions/ActionBuilder');

module.exports = [
    ActionBuilder.Complex('javascript')
        .withDescription('WARNING: THIS IS EXTREMELY DANGEROUS.')
        .withExample('{javascript;const os = require("os"); os.platform()}', 'win32')
        .withArguments((f) => f.require('code', 'string', true))
        .whenArguments(0, ActionBuilder.errors.notEnoughArguments)
        .whenDefault((context, action) => {
            if (!context.options.enableJavascript) return;
            const code = action.children.join('\n');
            const fn = function () { return eval(code) };
            return fn.call(context);
        }).build()
];
