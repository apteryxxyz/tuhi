'use strict';

const { Statement } = require('@tuhi/engine/lib/Statement');
const path = require('path');
const fs = require('fs');
const COMMANDS = {};

function defineCommand(keyword, command) {
    if (typeof options === 'function')
        command = { action: command };
    COMMANDS[keyword] = command;
}

function loadCommands(repl) {
    defineCommand('help', {
        help: 'Print this help message',
        action: () => {
            const commands = Object.entries(repl.commands)
                .sort((a, b) => a[0].localeCompare(b[0]));
            const mL = commands.reduce((m, [k]) => Math.max(m, k.length), 0) + 4;
            commands.forEach(([keyword, { help }]) => {
                console.info(`.${keyword.padEnd(mL)} ${help}`);
            });
        },
    });

    defineCommand('save', {
        help: 'Save all evaluated actions in this REPL session to a .tuhi file',
        action: (args) => {
            try {
                let file = args[0] || 'tuhi.save';
                if (!file.endsWith('.tuhi')) file += '.tuhi';
                const fullPath = path.resolve(process.cwd(), file);
                const source = repl.lines.join('\n');
                fs.writeFileSync(fullPath, source, 'utf8');
                console.info(`Session saved to ${file}`);
            } catch (err) {
                console.error(`Failed to save: ${err.message}`);
            }
        },
    });

    defineCommand('savejson', {
        help: 'Save all evaluated actions in this REPL session to a .json file',
        action: (args) => {
            try {
                let file = args[0] || 'tuhi.save';
                if (!file.endsWith('.json')) file += '.json';
                const fullPath = path.resolve(process.cwd(), file);
                const source = repl.lines.join('');
                const statement = Statement.parse(source);
                const json = JSON.stringify(statement.toJSON(), null, 4);
                fs.writeFileSync(fullPath, json, 'utf8');
                console.info(`Session saved to ${file}`);
            } catch (err) {
                console.error(`Failed to save: ${err.message}`);
            }
        }
    });

    defineCommand('exit', {
        help: 'Exit the REPL',
        action: () => repl.close() && repl.removeAllListeners(),
    });

    return COMMANDS;
}

module.exports = loadCommands;