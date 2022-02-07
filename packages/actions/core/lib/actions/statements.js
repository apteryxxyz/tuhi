'use strict';

const ActionBuilder = require('@tuhi/engine/lib/actions/ActionBuilder');
const { parseBoolean } = require('../utils/boolean');
const { parseArray } = require('../utils/array');

module.exports = [
    ActionBuilder.Statement('if')
        .withDescription(
            'Only execute/display if the `condition` argument resolves to a truthy value.' +
            'Also supports `else` statement.'
        )
        .withExample(
            '{if;true;This is true.;This is false.}\n' +
            '{if;25>5;25 is greater than 5.;25 is greater than 5.}',
            'This is true.\n25 is greater than 5.',
        )
        .withArguments((f) => ([
            f.require('condition', 'boolean'),
            f.require('then'),
            f.optional('else'),
        ]))
        .withSkipChildren(true)
        .whenArguments('0-1', ActionBuilder.errors.notEnoughArguments)
        .whenArguments('2-3', async function (context, action) {
            const errorCount = context.errors.length;

            let condition = action.children[0];
            if (typeof condition === 'object') {
                const result = await this.executeStatement(context, condition);
                if (context.errors.length > errorCount)
                    return ActionBuilder.errors.customError('Invalid condition');
                else condition = result;
            }
            condition = parseBoolean(condition, false);

            const THEN = action.children[1];
            const ELSE = action.children[2];
            let execute = condition ? THEN : ELSE;
            const result = await this.executeStatement(context, execute);
            if (context.errors.length > errorCount)
                return ActionBuilder.errors.invalidArgument;
            return result;
        })
        .whenDefault(ActionBuilder.errors.tooManyArguments)
        .build(),
    ActionBuilder.Statement('switch')
        .withSkipChildren(true)
        .whenArguments('0-3', ActionBuilder.errors.notEnoughArguments)
        .whenDefault(async function (context, action) {
            const errorCount = context.errors.length;

            let match = action.children[0];
            if (typeof match === 'object') {
                const result = await this.executeStatement(context, match);
                if (context.errors.length > errorCount)
                    return ActionBuilder.errors.invalidArgument;
                else match = result;
            }
            const args = action.children.slice(1);
            const fallback = args.pop();
            const cases = args
                .map((c, i) => i % 2 == 0 ? [c, args[i + 1]] : null)
                .filter(c => Array.isArray(c));

            let method = null;
            for (let [keys, value] of cases) {
                if (typeof keys !== 'string') continue;
                keys = parseArray(keys, [keys]);
                if (keys.includes(match)) {
                    method = value;
                    break;
                }
            }

            if (!method) method = fallback;
            if (typeof method === 'string') return method;
            const result = await this.executeStatement(context, method);
            return result;
        })
        .build(),
];
