'use strict';

const CoreActions = require('@tuhi-actions/core');
const Context = require('./Context');
const { Statement, Action } = require('./Action');
const pkg = require('../package.json');

const _executeStatement = Symbol('executeStatement');
const _executeAction = Symbol('executeAction');
const _cleanResult = Symbol('cleanResult');

class Engine {
    constructor(options = {}) {
        this.options = options;
    }

    // Shorthand for creating a new context
    createContext(options) {
        return new Context(options)
            .withEngine(this);
    }

    // Parse source code without executing
    parseSource(source) {
        if (typeof source !== 'string')
            throw new Error('First parameter must be a string');
        return Statement.parse(source);
    }

    // Executes a Tuhi script,
    // must be run with a context
    async execute(context, source) {
        // Ensure the parameters are correct
        if (!(context instanceof Context))
            throw new Error('First parameter must be an instance of \'Context\'');

        // Compile the source
        const isAction = source instanceof Action || source instanceof Statement;
        const statement = isAction ? source : Statement.parse(source);

        // Import the core actions and apply engine
        if (!context.options.hasImportedCoreActions) {
            context.importActions(CoreActions());
            context.withOption('hasImportedCoreActions', true);
            context.withEngine(this);
        }

        // Execute the statement
        const result = await this[_executeStatement](context, statement);
        return this[_cleanResult](context, '' + result);
    }

    // Executes all the actions in a statement, then itself
    async [_executeStatement](context, statement) {
        // If there are no children, then there is no actions
        // to execute so skip to the final execute
        if (statement.children.length === 0)
            return this[_executeAction](context, statement, true);

        // If there are no statements or actions in the children,
        // then there is again nothing to execute
        const hasStatementChildren = statement.children.some((c) => c instanceof Statement);
        const hasActionChildren = statement.children.some((c) => c instanceof Action);
        if (!hasActionChildren && !hasStatementChildren)
            return this[_executeAction](context, statement, true);

        // We dont want children in actions like the if statement
        // to always exclude, so we skip to the final execute
        // and pass the children actions to the main action
        const executor = context.actions[statement.name];
        if (executor && executor.skipChildren)
            return this[_executeAction](context, statement, true);

        const children = [];
        for (const child of statement.children) {
            const isStatement = child instanceof Statement;
            const isAction = child instanceof Action;
            if (!isStatement && !isAction) children.push(child);
            else children.push(await this[_executeStatement](context, child));
        }

        statement.children = children;
        return this[_executeAction](context, statement, true);
    }

    // Executes an action
    async [_executeAction](context, action, skipCheck = false) {
        // Only execute action that has no actions or statements
        // in the children 
        if (!skipCheck) {
            const hasActionChildren = action.children.some((c) => c instanceof Action);
            const hasStatementChildren = action.children.some((c) => c instanceof Statement);
            if (hasActionChildren || hasStatementChildren) return this[_executeStatement](context, action);
        }

        // Find the action executor, then execute
        const executor = context.actions[action.name];
        const isStatement = action instanceof Statement;
        if (!executor && isStatement) return action.children.join('') || '';
        if (!executor) return '';
        const result = await executor.execute(context, action);
        return result;
    }

    // Cleans the end result, depending on the options
    [_cleanResult](context, result) {
        if (Array.isArray(context.options.trim)) {
            if (context.options.trim[0]) result = result.trimLeft();
            if (context.options.trim[1]) result = result.trimRight();
        }
        return result;
    }
}

const ActionHandler = require('./actions/ActionHandler');
const ActionBuilder = require('./actions/ActionBuilder');
const ArgumentFactory = require('./actions/ArgumentFactory');

module.exports = Engine;
Object.assign(module.exports, { __esModule: true });
module.exports.default = Engine;
module.exports.Engine = Engine;
module.exports.Context = Context;
module.exports.Statement = Statement;
module.exports.Action = Action;
module.exports.ActionHandler = ActionHandler;
module.exports.ActionBuilder = ActionBuilder;
module.exports.ArgumentFactory = ArgumentFactory;
module.exports.version = pkg.version;
