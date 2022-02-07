'use strict';

function ArgumentFactory(args) {
    return args.map(makeArgument);
}

ArgumentFactory.kinds = {
    required: 'required',
    optional: 'optional',
    literal: 'literal',
    selection: 'selection'
};

ArgumentFactory.types = [
    'any',
    'transparent',
    'string',
    'number',
    'boolean',
    'array',
];

function makeArgument(kind, value, types, multiple) {
    if (typeof types === 'boolean' && !multiple)
        multiple = [types, types = undefined][0];
    if (!Array.isArray(value))
        value = (!value ? [] : [value]);
    if (!Array.isArray(types))
        types = (!types ? ['any'] : [types]);

    if (!kind || typeof kind !== 'string')
        throw new Error('Must provide a valid type');
    if (value.length === 0)
        throw new Error('One or more values must be provided');
    if (value.length === 1 && typeof value[0] !== 'string')
        throw new Error('If only 1 argument is provided, it must be a string');
    if (kind === ArgumentFactory.kinds.selection && value.length === 1)
        throw new Error('Selection arguments must be an array of values');
    if (kind === ArgumentFactory.kinds.literal && value.length !== 1)
        throw new Error('Literal arguments must be a single value');
    if (kind === ArgumentFactory.kinds.literal && multiple === true)
        throw new Error('Cannot have multiple of a single literal');
    if (types.find(t => typeof t !== 'string'))
        throw new Error('Types must all be strings');

    return {
        content: value,
        types: types,
        kind: kind,
        multiple: multiple === true
    };
}

ArgumentFactory.prototype.makeArgument = makeArgument;
ArgumentFactory.require = (v, t, m) => makeArgument(ArgumentFactory.kinds.required, v, t, m);
ArgumentFactory.optional = (v, t, m) => makeArgument(ArgumentFactory.kinds.optional, v, t, m);
ArgumentFactory.literal = (v, m) => makeArgument(ArgumentFactory.kinds.literal, v, 'string', m);
ArgumentFactory.selection = (v, m) => makeArgument(ArgumentFactory.kinds.selection, v, 'transparent', m);

module.exports = ArgumentFactory;

/*
const defaultOptions = {
    includeTypes: false,
    brackets: {
        default: ['', ''],
        required: ['<', '>'],
        optional: ['[', ']'],
        literal: ['', ''],
        selection: ['(', ')'],
    },
    separator: {
        default: ' ',
        required: ' ',
        optional: ' ',
        literal: ' ',
        selection: ' / ',
    },
    multiple: '...',
    ifNone: '',
};

function toString(inputs, options) {
    options = Object.assign(Object.assign({}, defaultOptions), options);
    const invalid = (a) => new Error('Invalid argument difinition\n' + JSON.stringify(a));

    function process(input) {
        if (typeof input === 'string') return input;
        const t1 = typeof input !== 'object' || typeof input.kind !== 'string';
        const t2 = typeof input.multiple !== 'boolean' || !Array.isArray(input.content);
        if (t1 || t2) throw invalid(input);

        let content = input.content.map(process);
        const separator = options.separator[input.kind] || options.separator.default;
        const brackets = options.brackets[input.kind] || options.brackets.default;

        if (content.length === 1) {
            const types = input.types[0] || 'none';
            if (input.types.length > 1) types = `(${input.types.join('|')})`;
            content[0] += (options.includeTypes ? ':' + types : '');
        }

        return brackets[0] +
            content.join(separator) +
            (input.multiple ? options.multiple : '') +
            brackets[1];
    }

    if (Array.isArray(inputs))
        return inputs.map(process)
            .join(options.separator.default);
    else if (typeof inputs === 'object')
        return process(inputs);
    else if (!inputs)
        return options.ifNone;
    throw invalid(inputs);
}

module.exports = {
    ArgumentFactory.kinds,
    require: rrequire,
    optional,
    literal,
    selection,
    makeArgument,
    toString
};*/