'use strict';

const ActionHandler = require('@tuhi/engine/lib/actions/ActionHandler');
const pkg = require('../package.json');
const path = require('path');
const fs = require('fs');

const actionsDirectory = path.resolve(__dirname, 'actions');
const directoryContext = fs.readdirSync(actionsDirectory);
const actionsToLoad = directoryContext
    .map(f => require(path.join(actionsDirectory, f)));

const CoreActions = ActionHandler(pkg);
CoreActions.loadActions(actionsToLoad);
module.exports = CoreActions;