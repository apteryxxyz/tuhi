'use strict';

const ActionBuilder = require('@tuhi/engine/lib/actions/ActionBuilder');

module.exports = [
    ActionBuilder.Simple('lb')
        .withDescription('Will be replaced with `{` on execution.')
        .withExample('This {lb}, is a bracket.', 'This {, is a bracket.')
        .whenDefault(() => '{')
        .build(),
    ActionBuilder.Simple('rb')
        .withDescription('Will be replaced with `}` on execution.')
        .withExample('This {rb}, is a bracket.', 'This }, is a bracket.')
        .whenDefault(() => '}')
        .build(),
    ActionBuilder.Simple('sc')
        .withDescription('Will be replaced with `;` on execution.')
        .withExample('This {sc}, is a semicolon.', 'This ;, is a semicolon.')
        .whenDefault(() => ';')
        .build(),
    ActionBuilder.Simple('nl')
        .withDescription('Will be replaced with `\\n` on execution.')
        .withExample('This {nl}, is a newline.', 'This \n, is a newline.')
        .whenDefault(() => '\n')
        .build(),
    ActionBuilder.Simple('comment')
        .withDescription('A subtag that just gets removed. Useful for documenting your code.')
        .withExample('This is a sentence. {//;This is a comment.}', 'This is a sentence.')
        .whenDefault(() => '')
        .build(),
];