'use strict';

const merge = require('lodash/merge');

function ActionHandler(pkg) {
    const name = pkg.name;
    const version = pkg.version;
    const actions = {};

    function loadAction(action) {
        if (action && Object.getPrototypeOf(action) === Object.prototype) {
            actions[action.name] = action;
        } else throw new Error('First parameter must be an object');
        return ActionWrapper;
    }

    function loadActions(actions) {
        if (Array.isArray(actions)) actions.flat().forEach(loadAction);
        else if (actions && Object.getPrototypeOf(actions) === Object.prototype) {
            Object.entries(actions).forEach(a => loadAction(a[1]));
        } else throw new Error('First parameter must be an array or object');
        return ActionWrapper;
    }

    function ActionWrapper(properties = {}) {
        if (!properties || Object.getPrototypeOf(properties) !== Object.prototype)
            throw new Error('First parameter must be an object');
        Object.keys(actions).forEach(n => merge(actions[n], properties));
        return { name, version, actions };
    }

    ActionWrapper.loadAction = loadAction;
    ActionWrapper.loadActions = loadActions;
    return ActionWrapper;
}

module.exports = ActionHandler;
