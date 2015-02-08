var path = require('path');
var Vow = require('vow');

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

var TRAILING_UNDERSCORES_RE = /(^_+|_+$)/g;

var SNAKE_CASE_RE = /^([a-z$][a-z0-9$]+)(_[a-z0-9$]+)+$/i;

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
    'finally',
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
    'case',
    'default',
    'with'
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
 * Snake case tester
 *
 * @param {String} name
 * @return {Boolean}
 */
exports.isSnakeCased = function(name) {
    return SNAKE_CASE_RE.test(name);
};

/**
 * Returns the function expression node if the provided node is an iffe,
 * other returns undefined.
 *
 * @param  {Object} node
 * @return {?Object}
 */
exports.getFunctionNodeFromIIFE = function(node) {
    if (node.type !== 'CallExpression') {
        return null;
    }

    var callee = node.callee;

    if (callee.type === 'FunctionExpression') {
        return callee;
    }

    if (callee.type === 'MemberExpression' &&
        callee.object.type === 'FunctionExpression' &&
        callee.property.type === 'Identifier' &&
        (callee.property.name === 'call' || callee.property.name === 'apply')
    ) {
        return callee.object;
    }

    return null;
};

/**
 * Trims leading and trailing underscores
 *
 * @param {String} name
 * @return {String}
 */
exports.trimUnderscores = function(name) {
    var res = name.replace(TRAILING_UNDERSCORES_RE, '');
    return res ? res : name;
};

/**
 * Whether or not the given path is relative
 * @param  {String}  path
 * @return {Boolean}
 */
exports.isRelativePath = function(path) {
    // Logic from: https://github.com/joyent/node/blob/4f1ae11a62b97052bc83756f8cb8700cc1f61661/lib/module.js#L237
    var start = path.substring(0, 2);
    return start === './' || start === '..';
};

/**
 * Resolves a relative filepath against the supplied base path
 * or just returns the filepath if not relative
 *
 * @param  {String} filepath
 * @param  {String} basePath
 * @return {String}
 */
exports.normalizePath = function(filepath, basePath) {
    if (this.isRelativePath(filepath)) {
        return path.resolve(basePath, filepath);
    }

    return filepath;
};

/**
 * Wraps a function such that you can interact with a promise and not a
 * node-style callback.
 *
 * @param  {Function} fn - function that expects a node-style callback
 * @return {Function} When invoked with arguments, returns a promise resolved/rejected
 *                    based on the results of the wrapped node-style callback
 */
exports.promisify = function(fn) {
    return function() {
        var deferred = Vow.defer();
        var args = [].slice.call(arguments);

        args.push(function(err, result) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(result);
            }
        });

        fn.apply(null, args);

        return deferred.promise();
    };
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
