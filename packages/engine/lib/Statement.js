'use strict';

const _compileString = Symbol('compileString');
const _compileJSON = Symbol('compileJSON');

// A statement is basically an array of actions
class Statement {
    constructor(source) {
        this.source = source;
        this.sourceType = typeof source;
        this.children = [];
    }

    static parse(source) {
        if (Action.validate(source)) return Action.parse(source);
        const statement = new Statement(source);
        return statement.compile();
    }

    // Determines which compile function to use
    compile() {
        switch (this.sourceType) {
            case 'string':
                return this[_compileString]();
            case 'object':
                return this[_compileJSON]();
            default:
                break;
        }
    }

    // Function to compile a string into an
    // array of actions aka a statement
    [_compileString](source = this.source) {
        source = source.replace(/\r?\n/g, '');
        const content = Statement.split(source);

        for (const value of content) {
            if (!Action.validate(value)) this.children.push(value);
            else this.children.push(Action.parse(value));
        }

        this.children = this.children.filter(Boolean);
        return this;
    }

    // Function to compile an JSON object into an
    // array of actions aka a statement
    [_compileJSON](json = this.source) {
        if (Array.isArray(json)) {
            this.children = json.map((j) => {
                if (typeof j === 'string') return j;
                else return Action.parse(j);
            });
            this.source = this.toString();
            return this;
        } else if (Object.getPrototypeOf(json) === Object.prototype) {
            return Action.parse(json);
        } else return json;
    }

    static validate(source) {
        if (typeof source === 'object') {
            return Array.isArray(source);
        } else {
            const hasBrackets = source.includes('{') && source.includes('}');
            const bracketCount = source.split('{').length - source.split('}').length;
            return hasBrackets && bracketCount === 0;
        }
    }

    static split(source) {
        let level = 0,
            placeHolder = '\uFFFF',
            result = '';

        for (const char of source.split('')) {
            if (char === '{') {
                if (level === 0) result += placeHolder + '{';
                else result += '{';
                level++;
            } else if (char === '}') {
                level--;
                if (level === 0) result += '}' + placeHolder;
                else result += '}';
            } else result += char;
        }

        return result.split(placeHolder);
    }

    toJSON() {
        return this.children.map((c) => c.toJSON?.() || c);
    }

    toString() {
        return this.children.map((c) => c.toString?.() || c).join('');
    }
}

// An action is a piece of logic within a
// string that can be executed
class Action {
    constructor(source) {
        this.name = '';
        this.source = source;
        this.sourceType = typeof source;
        this.children = [];
    }

    static parse(source) {
        const tag = new Action(source);
        return tag.compile();
    }

    // Determines which compile function to use
    compile() {
        switch (this.sourceType) {
            case 'string':
                return this[_compileString]();
            case 'object':
                return this[_compileJSON]();
            default:
                break;
        }
    }

    // Compile a string into an action
    [_compileString](source = this.source) {
        source = this.source.slice(1, -1);
        const parts = Action.split(source);
        this.name = parts[0];
        const args = parts.slice(1);

        this.children = args
            .map((a) => {
                if (!Statement.validate(a, true)) return a;
                else return Statement.parse(a);
            })
            .filter(Boolean);
        return this;
    }

    // Compile an JSON object into an action
    [_compileJSON](json = this.source) {
        this.name = json.name;
        this.children = json.children.map((c) => {
            if (typeof c === 'string') return c;
            else return Statement.parse(c);
        });
        this.source = this.toString();
        return this;
    }

    static validate(source) {
        if (typeof source === 'object') {
            return !Array.isArray(source) &&
                source.name &&
                Array.isArray(source.children);
        } else {
            const hasBrackets = source.startsWith('{') && source.endsWith('}');
            const bracketCount = source.split('{').length - source.split('}').length;
            let level = 0, timesAtZero = 0;

            for (const char of source.split('')) {
                if (level === 0) timesAtZero++;
                if (char === '{') level++;
                if (char === '}') level--;
            }

            return hasBrackets &&
                bracketCount === 0 &&
                timesAtZero === 1;
        }
    }

    static split(source) {
        const characters = source.split('');
        let level = 0,
            placeHolder = '\uFFFF',
            result = '';

        for (const char of characters) {
            if (char === '{') level++;
            if (char === '}') level--;
            if (level === 0 && char === ';') result += placeHolder;
            else result += char;
        }

        return result.split(placeHolder);
    }

    toJSON() {
        return {
            name: this.name,
            children: this.children.map((c) => c.toJSON ? c.toJSON() : c),
        }
    }

    toString() {
        return `{${this.name};${this.children.map(c => c.toString()).join(';')}}`;
    }
}

module.exports = {
    Statement,
    Action
};
