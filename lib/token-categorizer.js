var assert = require('assert');

var FUNCTION_TYPE_RE = /Function/;
var PAREN_KEYWORD_TYPE_RE = /Statement$|^CatchClause$/;
var NO_PAREN_KEYWORD_TYPE_RE = /^ExpressionStatement$|^ReturnStatement$|^ThrowStatement$/;
var QUASI_STATEMENT_TYPE_RE = /Statement$|Declaration$/;

function nodeContains(node, token) {
    var currentNode = token.parentElement;
    while (currentNode) {
        if (currentNode === node) {
            return true;
        }
        currentNode = currentNode.parentElement;
    }
    return false;
}

/**
 * Returns the type of AST node or ECMAScript production in which the provided
 * open parenthesis token is included.
 *
 * @param {Object} token
 * @returns {String}
 */
exports.categorizeOpenParen = function(token) {
    assert(token.value === '(', 'Input token must be a parenthesis');
    var node = token.parentElement;
    var nodeType = node.type;
    var prevToken = token.getPreviousCodeToken();

    // Outermost grouping parenthesis
    if (!prevToken) {
        return 'ParenthesizedExpression';
    }

    // Part of a parentheses-bearing statement (if, with, while, switch, etc.)
    if (prevToken.type === 'Keyword' && PAREN_KEYWORD_TYPE_RE.test(nodeType) &&
        !NO_PAREN_KEYWORD_TYPE_RE.test(nodeType)) {

        return 'Statement';
    }

    // Part of a function definition (declaration, expression, method, etc.)
    if (FUNCTION_TYPE_RE.test(nodeType) &&

        // Name is optional for function expressions
        (prevToken.type === 'Identifier' || prevToken.value === 'function')) {

        return 'Function';
    }

    // Part of a call expression
    var prevNode = prevToken.parentElement;
    if ((nodeType === 'CallExpression' || nodeType === 'NewExpression') &&

        // Must not be inside an arguments list or other grouping parentheses
        prevToken.value !== ',' && prevToken.value !== '(' &&

        // If the callee is parenthesized (e.g., `(foo.bar)()`), prevNode will match node
        // Otherwise (e.g., `foo.bar()`), prevToken must be the last token of the callee node
        (prevNode === node || prevToken === node.callee.getLastToken())) {

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
 * @returns {String}
 */
exports.categorizeCloseParen = function(token) {
    assert(token.value === ')', 'Input token must be a parenthesis');
    var node = token.parentElement;
    var nodeType = node.type;
    var nextToken = token.getNextCodeToken();

    // Terminal statement
    if (nextToken.type === 'EOF') {
        switch (nodeType) {
            case 'DoWhileStatement':
                return 'Statement';
            case 'CallExpression':
            case 'NewExpression':
                return 'CallExpression';
            default:
                return 'ParenthesizedExpression';
        }
    }

    // Part of a parentheses-bearing statement (if, with, while, switch, etc.)
    if (PAREN_KEYWORD_TYPE_RE.test(nodeType) && !NO_PAREN_KEYWORD_TYPE_RE.test(nodeType)) {
        // Closing parentheses for `switch` and `catch` must be followed by "{"
        // Closing parentheses for `do..while` may be the last punctuation inside a block
        if (nextToken.value === '{' || nextToken.value === '}') {
            return 'Statement';
        }

        // Closing parentheses for other statements must be followed by a statement or declaration
        var nextNode = nextToken.parentElement;
        while (!nodeContains(nextNode, token)) {
            if (QUASI_STATEMENT_TYPE_RE.test(nextNode.type)) {
                return 'Statement';
            }
            nextNode = nextNode.parentElement;
        }
    }

    // Part of a function definition (declaration, expression, method, etc.)
    if (nextToken.value === '{' && FUNCTION_TYPE_RE.test(nodeType)) {
        return 'Function';
    }

    // Part of a call expression
    if ((nodeType === 'CallExpression' || nodeType === 'NewExpression')) {
        var openParen = node.callee.getNextToken();
        if (openParen.parentElement === node && node.lastChild === token) {
            return 'CallExpression';
        }
    }

    // All remaining cases are grouping parentheses
    return 'ParenthesizedExpression';
};
