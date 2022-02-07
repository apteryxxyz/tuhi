const REGEX = /(?:(?:^|(>=?|==|<=?|!==?|===?))(?:\s*-?\d+(\.\d+)?(?:[eE][+-]?\d+)?\s*))+$/;

function parseBoolean(value, fallback) {
    if (!value) return false;
    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
        switch (value.toLowerCase()) {
            case 'true':
                return true;
            case 'false':
            case 'undefined':
            case 'null':
            case 'void 0':
                return false;
            default:
                break;
        }

        if (REGEX.test(value)) return eval(value);
    }

    if (typeof value === 'number') return value !== 0;
    const asNumber = parseFloat(value);
    if (!isNaN(asNumber)) return asNumber !== 0;

    return !!fallback;
}

module.exports = { parseBoolean };