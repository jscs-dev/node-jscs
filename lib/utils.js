// 7.5.2 Keywords
var ES3_KEYWORDS = {
    'break': true,
    'case': true,
    'catch': true,
    'continue': true,
    'default': true,
    'delete': true,
    'do': true,
    'else': true,
    'finally': true,
    'for': true,
    'function': true,
    'if': true,
    'in': true,
    'instanceof': true,
    'new': true,
    'null': true,
    'return': true,
    'switch': true,
    'this': true,
    'throw': true,
    'try': true,
    'typeof': true,
    'var': true,
    'void': true,
    'while': true,
    'with': true
};

// 7.5.3 Future Reserved Words
var ES3_FUTURE_RESERVED_WORDS = {
    'abstract': true,
    'boolean': true,
    'byte': true,
    'char': true,
    'class': true,
    'const': true,
    'debugger': true,
    'double': true,
    'enum': true,
    'export': true,
    'extends': true,
    'final': true,
    'float': true,
    'goto': true,
    'implements': true,
    'import': true,
    'int': true,
    'interface': true,
    'long': true,
    'native': true,
    'package': true,
    'private': true,
    'protected': true,
    'public': true,
    'short': true,
    'static': true,
    'super': true,
    'synchronized': true,
    'throws': true,
    'transient': true,
    'volatile': true
};

var IDENTIFIER_NAME_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/**
 * All keywords where spaces are a stylistic choice
 * @type {Array}
 */
exports.spacedKeywords = [
    'do',
    'for',
    'if',
    'else',
    'switch',
    'case',
    'try',
    'catch',
    'void',
    'while',
    'with',
    'return',
    'typeof',
    'function'
];

/**
 * All keywords where curly braces are a stylistic choice
 * @type {Array}
 */
exports.curlyBracedKeywords = [
    'if',
    'else',
    'for',
    'while',
    'do',
    'try',
    'catch',
    'case',
    'default'
];

/**
 * Returns true if word is keyword in ECMAScript 3 specification.
 *
 * @param {String} word
 * @returns {Boolean}
 */
exports.isEs3Keyword = function(word) {
    return Boolean(ES3_KEYWORDS[word]);
};

/**
 * Returns true if word is future reserved word in ECMAScript 3 specification.
 *
 * @param {String} word
 * @returns {Boolean}
 */
exports.isEs3FutureReservedWord = function(word) {
    return Boolean(ES3_FUTURE_RESERVED_WORDS[word]);
};

/**
 * Returns true if name is valid identifier name.
 *
 * @param {String} name
 * @returns {Boolean}
 */
exports.isValidIdentifierName = function(name) {
    return IDENTIFIER_NAME_RE.test(name);
};

/**
 * All possible binary operators supported by JSCS
 * @type {Array}
 */
exports.binaryOperators = [

    // assignment operators
    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
    '&=', '|=', '^=',

    '+', '-', '*', '/', '%', '<<', '>>', '>>>', '&',
    '|', '^', '&&', '||', '===', '==', '>=',
    '<=', '<', '>', '!=', '!==',

    ','
];

/**
 * Increment and decrement operators
 * @type {Array}
 */
exports.incrementAndDecrementOperators = ['++', '--'];

/**
 * All possible unary operators supported by JSCS
 * @type {Array}
 */
exports.unaryOperators = ['-', '+', '!', '~'].concat(exports.incrementAndDecrementOperators);

/**
 * All possible operators support by JSCS
 * @type {Array}
 */
exports.operators = exports.binaryOperators.concat(exports.unaryOperators);
