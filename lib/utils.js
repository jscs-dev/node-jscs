var assert = require('assert');
var path = require('path');
var Vow = require('vow');

var IDENTIFIER_NAME_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

var TRAILING_UNDERSCORES_RE = /(^_+|_+$)/g;

var SNAKE_CASE_RE = /^([a-z$][a-z0-9$]+)(_[a-z0-9$]+)+$/i;

var FUNCTION_TYPE_RE = /Function/;
var STATEMENT_TYPE_RE = /Statement$/;
var NO_PAREN_STATEMENT_TYPE_RE = /^ExpressionStatement$|^ReturnStatement$|^ThrowStatement$/;
var ANY_STATEMENT_TYPE_RE = /Statement$|Declaration$/;

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
 * Returns the type of AST node or ECMAScript production in which the provided
 * open parenthesis token is included.
 *
 * @param {Object} token
 * @param {JsFile} file
 * @returns {String}
 */
exports.categorizeOpenParen = function(token, file) {
    assert(token.value === '(', 'Input token must be a round bracket');
    var node = file.getNodeByRange(token.range[0]);
    var nodeType = node.type;
    var prevToken = file.getPrevToken(token);

    // Outermost grouping parenthesis
    if (!prevToken) {
        return 'ParenthesizedExpression';
    }

    // Part of a parentheses-bearing statement (if, with, while, switch, etc.)
    if (prevToken.type === 'Keyword' && STATEMENT_TYPE_RE.test(nodeType) &&
        !NO_PAREN_STATEMENT_TYPE_RE.test(nodeType)) {

        return 'Statement';
    }

    // Part of a function definition (declaration, expression, method, etc.)
    if (FUNCTION_TYPE_RE.test(nodeType) &&

        // Name is optional for function expressions
        (prevToken.type === 'Identifier' || prevToken.value === 'function')) {

        return 'Function';
    }

    // Part of a call expression
    var prevNode = file.getNodeByRange(prevToken.range[0]);
    if (nodeType === 'CallExpression' &&

        // Must not be inside an arguments list or other grouping parentheses
        prevToken.value !== ',' && prevToken.value !== '(' &&

        // If the callee is parenthesized (e.g., `(foo.bar)()`), prevNode will match node
        // Otherwise (e.g., `foo.bar()`), prevToken must be the last token of the callee node
        (prevNode === node || prevToken === file.getLastNodeToken(node.callee))) {

        return 'CallExpression';
    }

    // All remaining cases are grouping parentheses
    return 'ParenthesizedExpression';
};

/**
 * Returns the type of AST node or ECMAScript production in which the provided
 * close parenthesis token is included.
 *
 * @param {Object} token
 * @param {JsFile} file
 * @returns {String}
 */
exports.categorizeCloseParen = function(token, file) {
    assert(token.value === ')', 'Input token must be a round bracket');
    var node = file.getNodeByRange(token.range[0]);
    var nodeType = node.type;
    var nextToken = file.getNextToken(token);

    // Terminal statement
    if (nextToken.type === 'EOF') {
        switch (nodeType) {
            case 'DoWhileStatement':
                return 'Statement';
            case 'CallExpression':
                return 'CallExpression';
            default:
                return 'ParenthesizedExpression';
        }
    }

    // Part of a parentheses-bearing statement (if, with, while, switch, etc.)
    if (STATEMENT_TYPE_RE.test(nodeType) && !NO_PAREN_STATEMENT_TYPE_RE.test(nodeType)) {
        // Closing parentheses for switch must be followed by "{"
        if (nextToken.value === '{') {
            return 'Statement';
        }

        // Closing parentheses for other statements must be followed by a statement
        var nextNode = file.getNodeByRange(nextToken.range[0]);
        while (nextNode && nextNode.range[0] >= token.range[1]) {
            if (ANY_STATEMENT_TYPE_RE.test(nextNode.type)) {
                return 'Statement';
            }
            nextNode = nextNode.parentNode;
        }
    }

    // Part of a function definition (declaration, expression, method, etc.)
    if (nextToken.value === '{' && FUNCTION_TYPE_RE.test(nodeType)) {
        return 'Function';
    }

    // Part of a call expression
    if (nodeType === 'CallExpression' && nextToken.range[0] >= node.range[1]) {
        return 'CallExpression';
    }

    // All remaining cases are grouping parentheses
    return 'ParenthesizedExpression';
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
 *
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
 * Wrapper to encapsulate getting private property for babel type
 *
 * @returns {String}
 */
exports.getBabelType = function(property) {
    return property._babelType;
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
    '<=', '<', '>', '!=', '!=='
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
