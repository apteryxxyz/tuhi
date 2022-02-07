'use strict';

const cloneDeep = require('lodash/cloneDeep');

class Context {
    constructor(options = {}) {
        this.options = options;
        this.inputs = [];
        this.actions = {};
        this.variables = {};
        this.errors = [];
        this.blocks = [];
    }

    // Clones this context, used for testing an execution
    // of an action before executing on the main context
    clone() {
        return cloneDeep(this);
    }

    // Used for passing the users args/inputs to the context
    withInputs(value) {
        if (Array.isArray(value)) {
            this.inputs = value;
            return this;
        } else throw new Error('First parameter must be an array');
    }

    // Used for passing options into the context, post creation
    withOption(name, value) {
        if (typeof name === 'string') {
            this.options[name] = value;
            return this;
        } else throw new Error('First parameter must be a string');
    }

    // TODO: add check to see if engine is valid
    withEngine(engine) {
        this.engine = engine;
        return this;
    }

    // Imports actions that can be used in the context
    importActions(actions) {
        if (actions && actions.actions) actions = actions.actions;
        if (actions && Object.getPrototypeOf(actions) !== Object.prototype)
            throw new Error('First parameter is not an object');

        Object.entries(actions)
            .forEach(([name, action]) => this.actions[name] = action);
        return this;
    }
};

module.exports = Context;