# Tuhi

Tuhi (to-he) is templating language, with the idea
of adding logic to string templates.

Tuhi is still is early development and may be unstable,
there is no documention and things are likely to change.

I have a lot of planned use cases, I will announce them
once I have added support for them.

## Explanation

Tuhi is made up of what I call "Actions".
An action is a block within a string that will be
executed when requested.

For example, when `My favourite number is {math;2+3}!`
is run in the executor it will return
`My favourite number is 5!`.
In this case `math` is the action.

This is a very simple example, it can get a lot more
complex and powerful.

## Installation

```sh
# with npm
npm install tuhi
# with yarn
yarn add tuhi
```

Command line only:

```sh
# with npm
npm install -g @tuhi/cli
# with yarn
yarn add -G @tuhi/cli
```

## More Examples

### Command Line

If you want to execute the script from a file, you can
use `tuhi script_file.tuhi`.

For running a script directly in the terminal, use
`tuhi -e "<script>"`.

There is also a REPL, use `tuhi`.

### Node.js

```js
const { Engine, Context } = require('tuhi');
// OR
import { Engine, Context } from 'tuhi';

const engine = new Engine(); // Create an instance of the engine
const context = new Context(); // Create the context for our script to use
context.withEngine(engine); // Allow actions access to the engine

const source1 = `Does 9 + 10 = 21? {set;number;{math;9+10}}`;
const result1 = await engine.execute(context, source1); // Execute the script
console.log(result1); // => Does 9 + 10 = 21?
console.log(context.variables); // => { num: 19 };

const source2 = `{if;{get;number}===21;Yes, it does!;No, it does not!}`;
const result2 = await engine.execute(context, source2);
console.log(result2); // => No, it does not!
```
