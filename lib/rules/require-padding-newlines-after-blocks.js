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
        this._allowInCallExpressions = false;
        this._allowInArrayExpressions = false;

        if (typeof value === 'object') {
            assert(Array.isArray(value.allExcept), this.getOptionName() + ' option requires "allExcept" ' +
                'to be an array');
            assert(value.allExcept.length > 0, this.getOptionName() + ' option requires "allExcept" ' +
                'to have at least one item or be set to `true`');

            value.allExcept.forEach((function(except) {
                if (except === 'inCallExpressions') {
                    this._allowInCallExpressions = true;
                } else if (except === 'inArrayExpressions') {
                    this._allowInArrayExpressions = true;
                } else {
                    assert(false, this.getOptionName() + ' option requires "allExcept" to only have ' +
                        '`inCallExpressions` or `inArrayExpressions`');
                }
            }).bind(this));
        } else {
            assert(value === true,
                this.getOptionName() + ' option requires true value or object'
            );
        }
    },

    getOptionName: function() {
        return 'requirePaddingNewLinesAfterBlocks';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', (function(node) {

            var closingBracket = file.getLastNodeToken(node);
            var parentNode = node.parentNode;

            var nextToken = file.getNextToken(closingBracket);

            var block = node.parentNode;
            if (block && block.parentNode) {
                var parent = block.parentNode;

                if (this._allowInCallExpressions &&
                    parent.type === 'CallExpression' &&
                    parent.arguments.indexOf(block) !== -1) {
                    return;
                }

                if (this._allowInArrayExpressions &&
                    parent.type === 'ArrayExpression' &&
                    parent.elements.indexOf(block) !== -1) {
                    return;
                }
            }

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
                    message: 'Missing newline after block'
                });

                return;
            }
        }).bind(this));
    }
};
