const { Engine, Context } = require('tuhi');
const engine = new Engine();
const context = new Context();

const source = `
{lb}math{sc}500*{lb}math{sc}pi{rb}{rb}{nl}
{math;500*{math;pi}}
`;

engine.execute(context, source)
    .then(console.log);