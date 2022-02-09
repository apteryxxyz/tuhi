const Tuhi = {
    Engine: require('@tuhi/engine/lib/Engine'),
    Context: require('@tuhi/engine/lib/Context'),
    Statement: require('@tuhi/engine/lib/Action').Statement,
    Action: require('@tuhi/engine/lib/Action').Action,

    ActionHandler: require('@tuhi/engine/lib/actions/ActionHandler'),
    ActionBuilder: require('@tuhi/engine/lib/actions/ActionBuilder'),
    ArgumentFactory: require('@tuhi/engine/lib/actions/ArgumentFactory'),

    CLI: require('@tuhi/cli/lib/CLI'),
    REPL: require('@tuhi/cli/lib/repl/REPL'),
};

const parentKeys = Object.keys(Tuhi);
function deleteProperties(obj) {
    return Object.fromEntries(Object.entries(obj)
        .map(([key, value]) => {
            delete value.__esModule;
            delete value.default;
            delete value.version;
            for (const key of parentKeys) delete value[key];

            if (Object.getPrototypeOf(value) === Object.prototype) {
                return deleteProperties(value);
            } else return [key, value];
        }));
}

module.exports = deleteProperties(Tuhi);