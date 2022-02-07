'use strict';

const ArgumentFactory = require('./ArgumentFactory');

class ActionBuilder {
    static General(name) { return new ActionBuilder().withName(name).withCategory('general'); }
    static Simple(name) { return new ActionBuilder().withName(name).withCategory('simple'); }
    static Complex(name) { return new ActionBuilder().withName(name).withCategory('complex'); }
    static Statement(name) { return new ActionBuilder().withName(name).withCategory('statement'); }

    constructor() {
        this.properties = {};
        this.execute = {
            conditional: [],
            default: () => null,
        };
    }

    withProp(key, value) {
        this.properties[key] = value;
        return this;
    }

    withName(name) {
        return this.withProp('name', name);
    }

    withCategory(category) {
        return this.withProp('category', category);
    }

    withDescription(description) {
        return this.withProp('description', description);
    }

    withUsage(usage) {
        return this.withProp('usage', usage);
    }

    withExample(code, input, output) {
        if (output == null) {
            output = input;
            input = null;
        }
        this.withProp('exampleCode', code);
        this.withProp('exampleIn', input);
        return this.withProp('exampleOut', output);
    }

    withArguments(args) {
        if (typeof args === 'function')
            args = args(ArgumentFactory);
        return this.withProp('arguments', args);
    }

    withSkipChildren(value) {
        return this.withProp('skipChildren', value);
    }

    whenArguments(condition, action) {
        if (typeof condition === 'number') {
            this.whenArguments((_, action) => action.children.length === condition, action);
        } else if (typeof condition === 'string') {
            condition = condition.replace(/\s*/g, '');

            if (/^[><=!]\d+$/.test(condition)) { //<, >, = or ! a single count
                const value = parseInt(condition.substring(1));
                switch (condition[0]) {
                    case '<': this.whenArguments((_, action) => action.children.length < value, action); break;
                    case '>': this.whenArguments((_, action) => action.children.length > value, action); break;
                    case '!': this.whenArguments((_, action) => action.children.length !== value, action); break;
                    case '=': this.whenArguments((_, action) => action.children.length === value, action); break;
                }

            } else if (/^(>=|<=)\d+$/.test(condition)) { //<= or >= a single count
                const value = parseInt(condition.substring(2));
                switch (condition[0]) {
                    case '>=': this.whenArguments((_, action) => action.children.length >= value, action); break;
                    case '<=': this.whenArguments((_, action) => action.children.length <= value, action); break;
                }

            } else if (/^\d+-\d+$/.test(condition)) { //inclusive range of values ex 2-5
                const split = condition.split('-');
                let from = parseInt(split[0]), to = parseInt(split[1]);
                if (from > to) from = (to, to = from)[0];
                this.whenArguments((_, action) => action.children.length >= from && action.children.length <= to, action);

            } else if (/^\d+(,\d+)+$/.test(condition)) { //list of values ex 1, 2, 6
                let values = condition.split(',').map(v => parseInt(v));
                this.whenArguments((_, action) => values.indexOf(action.children.length) != -1, action);

            } else if (/^\d+$/.test(condition)) {//single value, no operator
                this.whenArguments(parseInt(condition), action);

            } else
                throw new Error('Failed to determine conditions for ' + condition + ' for action ' + this.properties.name);

        } else if (typeof condition === 'function') {
            this.execute.conditional.push({ condition, action });
        }
        return this;
    }

    whenDefault(execute) {
        this.execute.default = execute;
        return this;
    }

    build() {
        const built = { ...this.properties };
        const conditionalExec = this.execute.conditional;
        const defaultExec = this.execute.default;

        built.executeStatement = async function (context, action) {
            if (!context.engine) return ActionBuilder.errors.missingEngine(context, action);
            return context.engine.execute(context, action);
        }

        built.execute = async function (context, action) {
            let callback = defaultExec;

            for (const exec of conditionalExec) {
                if (exec.condition.apply(built, [context, action])) {
                    callback = exec.action;
                    break;
                }
            }

            let result = callback.apply(built, [context, action]);
            if (typeof result === 'function') result = result(context, action);
            if (typeof result !== 'string') result = await result;
            if (result && typeof result === 'object') result = JSON.stringify(result);
            return '' + (result ?? '');
        }

        return built;
    }
}

module.exports = ActionBuilder;


function error(context, action, message) {
    if (typeof message === 'message') message = '`' + message + '`';
    context.errors.push({ action, message: action.name + ': ' + message });
    return message;
}

ActionBuilder.errors = {
    missingEngine: (c, t) => error(c, t, 'Engine not available'),
    notEnoughArguments: (c, t) => error(c, t, 'Not enough arguments'),
    tooManyArguments: (c, t) => error(c, t, 'Too many arguments'),
    invalidArgument: (c, t) => error(c, t, 'Invalid argument'),
    invalidExpression: (c, t) => error(c, t, 'Invalid expression'),
    notANumber: (c, t) => error(c, t, 'Not a number'),
    notAnArray: (c, t) => error(c, t, 'Not an array'),
    notABoolean: (c, t) => error(c, t, 'Not a boolean'),
    customError: (msg) => (c, t) => error(c, t, msg),
}

module.exports = ActionBuilder;