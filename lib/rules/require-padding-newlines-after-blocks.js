/**
 * Requires newline after blocks
 *
 * Type: `Boolean`
 *
 * Value: `true`
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

var excludes = {
    'IfStatement': ['else'],
    'DoWhileStatement': ['while'],
    'TryStatement': ['catch', 'finally'],
    'CatchClause': ['finally'],
    'FunctionExpression': ['.'],
};

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        assert(
            value === true,
            this.getOptionName() + ' option requires a true value or should be removed'
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

            while (nextToken.type !== 'EOF') {
                var excludeValues = excludes[parentNode.type];
                if (excludeValues && excludeValues.indexOf(nextToken.value) !== -1) {
                    return;
                }

                if (closingBracket.loc.end.line === nextToken.loc.start.line) {
                    nextToken = file.getNextToken(nextToken);
                    continue;
                }

                if (nextToken.type === 'Punctuator' && nextToken.value === '}') {
                    return;
                }

                errors.assert.linesBetween({
                    token: closingBracket,
                    nextToken: nextToken,
                    atLeast: 2,
                    message: 'Missing newline after closing curly brace'
                });

                return;
            }
        });
    }
};
