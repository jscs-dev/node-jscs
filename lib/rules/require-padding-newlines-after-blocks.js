/**
 * Requires newline after blocks
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewLinesAfterBlocks": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function () {
 *     for (var i = 0; i < 2; i++) {
 *         if (true) {
 *             return false;
 *         }
 *
 *         continue;
 *     }
 *
 *     var obj = {
 *         foo: function() {
 *             return 1;
 *         },
 *
 *         bar: function() {
 *             return 2;
 *         }
 *     };
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function () {
 *     for (var i = 0; i < 2; i++) {
 *         if (true) {
 *             return false;
 *         }
 *         continue;
 *     }
 *     var obj = {
 *         foo: function() {
 *             return 1;
 *         },
 *         bar: function() {
 *             return 2;
 *         }
 *     };
 * }
 * ```
 */

var assert = require('assert');

var excludes = [
    ['IfStatement', 'else'],
    ['DoWhileStatement', 'while'],
    ['TryStatement', 'catch'],
    ['TryStatement', 'finally'],
    ['CatchClause', 'finally'],
    ['FunctionExpression', '.']
];

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        assert(
            typeof value === 'boolean',
            'requirePaddingNewLinesAfterBlocks option requires boolean value'
        );
        assert(
            value === true,
            'requirePaddingNewLinesAfterBlocks option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requirePaddingNewLinesAfterBlocks';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {

            var closingBracket = file.getLastNodeToken(node);
            var parentNode = node.parentNode;

            var nextToken = file.getNextToken(closingBracket);

            function tokenShouldBeExcluded(item) {
                return parentNode.type === item[0] && nextToken.value === item[1];
            }

            while (nextToken !== undefined) {
                var excludedStatement = excludes.some(tokenShouldBeExcluded);
                if (excludedStatement) {
                    return;
                }

                if (closingBracket.loc.end.line === nextToken.loc.start.line) {
                    nextToken = file.getNextToken(nextToken);
                    continue;
                }

                if (nextToken.type === 'Punctuator' && nextToken.value === '}') {
                    return;
                }

                errors.assert.differentLine({
                    token: closingBracket,
                    nextToken: nextToken,
                    lines: 1,
                    message: 'Missing newline after closing curly brace'
                });

                return;
            }
        });
    }
};
