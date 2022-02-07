'use strict';

const pkg = require('../../package.json');
const Engine = require('@tuhi/engine/lib/Engine');
const Context = require('@tuhi/engine/lib/Context');
const loadCommands = require('./commands');

const { Interface } = require('readline');
const os = require('os');
const path = require('path');
const fs = require('fs');

const _onLine = Symbol('onLine');

function complete(line) {
    const completions = '.help .exit .save'.split(' ');
    const hits = this.completes.filter(c => c.startsWith(line));
    return [hits.length ? hits : completions, line];
}

class REPL extends Interface {
    constructor(input, output, terminal, completer = complete) {
        super({
            prompt: '> ',
            input,
            output,
            completer,
            terminal,
            tabSize: 4,
            historySize: 256,
            removeHistoryDuplicates: true,
        });

        this.isActive = false;
        this.historyFile = path.resolve(os.homedir(), '.tuhi_history');
        this.history = this.loadHistory();
        this.commands = {};
        this.commands = loadCommands(this);
        this.lines = [];
        this.engine = new Engine();
        this.context = new Context({ trim: [1, 1] });
    }

    displayPrompt() {
        this.prompt();
    }

    start() {
        this.isActive = true;

        console.info(`Welcome to Tuhi v${Engine.version}`);
        console.info('Type ".help" for a list of commands');
        this.displayPrompt();

        this.on('line', async (line) => {
            this.saveHistory();
            await this[_onLine](line);
            if (line !== '.exit') this.displayPrompt();
        });
    }

    async [_onLine](line) {
        if (line.startsWith('.')) {
            const cmd = line.slice(1).split(' ');
            if (!this.commands[cmd[0]]) console.error('Invalid REPL command');
            else this.commands[cmd[0]].action(cmd.slice(1));
        } else {
            const clone = this.context.clone();
            clone.withOption('suppressConsole', true);
            await this.engine.execute(clone, line);
            if (clone.errors.length > 0) {
                console.error(clone.errors[0].message);
            } else {
                this.lines.push(line);
                const result = await this.engine.execute(this.context, line);
                console.info(result || undefined);
            }
        }
    }

    loadHistory() {
        const historyExists = fs.existsSync(this.historyFile);
        if (!historyExists) fs.writeFileSync(this.historyFile, '');
        return fs.readFileSync(this.historyFile, 'utf8')
            .split(/\r?\n/g).filter(Boolean);
    }

    saveHistory() {
        const history = this.history;
        fs.writeFileSync(this.historyFile, history.join('\r\n'));
    }
}

module.exports = REPL;
Object.assign(module.exports, { __esModule: true });
module.exports.default = REPL;
module.exports.REPL = REPL;
module.exports.version = pkg.version;