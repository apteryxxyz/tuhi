'use strict';

const { program } = require('commander');
const path = require('path');
const fs = require('fs');

const pkg = require('../package.json');
const { Engine, Context, version } = require('@tuhi/engine');
const CoreActions = require('@tuhi-actions/core');
const REPL = require('./repl/REPL');

function applyDefaults(context, engine, options) {
    return context.withInputs(options.args || [])
        .importActions(CoreActions({ engine }))
        .withOption('enableJavascript', options.enableJavascript);
}

function CLI() {
    program
        .configureOutput({
            writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
            outputError: (str, write) => write(str.replace('error: ', '')),
        });

    program
        .name('tuhi')
        .argument('[script]', 'path to a tuhi file to execute')
        .option('-e, --eval "<script>"', 'evaluate script')
        .option('-v, --version', 'output the version numbers')
        .option('-a, --args <inputs...>', 'pass user inputs to the script')
        .option('--enable-javascript', 'DANGEROUS: enable javascript action')
        .action(async (script, options) => {
            if (options.version) {
                console.info(`Engine v${version}`);
                console.info(`Actions v${CoreActions.version}`);
                console.info(`CLI v${pkg.version}`);
                process.exit(0);
            }

            if (options.eval) {
                const engine = new Engine();
                const context = new Engine.Context({ trim: [1, 1] });
                applyDefaults(context, engine, options);
                const result = await engine.execute(context, options.eval);

                if (context.errors.length > 0) program.error(context.errors[0].message);
                else console.info(result || undefined);
                process.exit(0);
            }

            if (script) {
                if (!script.endsWith('.tuhi')) script += '.tuhi';
                const filePath = path.resolve(process.cwd(), script);
                if (!fs.lstatSync(filePath)) program.error(`cannot find script '${filePath}'`);
                const source = fs.readFileSync(filePath, 'utf8');

                const engine = new Engine();
                const context = new Context({ trim: [1, 1] });
                applyDefaults(context, engine, options);
                const result = await engine.execute(context, source);

                if (context.errors.length > 0) return program.error(context.errors[0].message);
                else console.info(result || undefined);
                process.exit(0);
            }

            const { stdin, stdout } = require('process');
            const repl = new REPL(stdin, stdout, true);
            applyDefaults(repl.context, repl.engine, options);
            return repl.start();
        });

    program.parse();
}

module.exports = CLI;
Object.assign(module.exports, { __esModule: true });
module.exports.default = CLI;
module.exports.CLI = CLI;
module.exports.REPL = REPL;