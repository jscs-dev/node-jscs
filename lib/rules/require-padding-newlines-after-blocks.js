/**
 * Requires newline after blocks
 *
 * Type: `Boolean` or `Object`
 *
 * Values:
 * - `true`: always require a newline after blocks
 * - `Object`:
 *      - `"allExcept"`: `Array`
 *          - `"inCallExpressions"` Blocks don't need a line of padding in argument lists
 *          - `"inArrayExpressions"` Blocks don't need a line of padding in arrays
 *          - `"inProperties"` Blocks don't need a line of padding as object properties
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewLinesAfterBlocks": true
 * "requirePaddingNewLinesAfterBlocks": {
 *     "allExcept": ["inCallExpressions", "inArrayExpressions", "inProperties"]
 * }
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
 *
 *     func(
 *          function() {
 *          }
 *
 *     );
 *
 *     var a = [
 *         function() {
 *         }
 *
 *     ]
 *
 * }
 * ```
 *
 * ##### Valid for `{ "allExcept": ["inCallExpressions"] }`
 *
 * ```js
 * func(
 *     2,
 *     3,
 *     function() {
 *     }
 * );
 * ```
 *
 * ##### Valid for `{ "allExcept": ["inArrayExpressions"] }`
 *
 * ```js
 * var foo = [
 *     2,
 *     3,
 *     function() {
 *     }
 * ];
 * ```
* ##### Valid for `{ "allExcept": ["inProperties"] }`
 *
 * ```js
 * var foo = {
 *     a: 2,
 *     b: function() {
 *     },
 *     c: 3
 * ];
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

function isException(parent, exceptions) {
    var grandpa = parent.parentNode;

    // Check if this block is used in call or array expression
    if (exceptions[grandpa.type]) {
        if (grandpa.arguments) {
            return grandpa.arguments.indexOf(parent) > -1;
        } else {
            return true;
        }
    }

    return false;
}

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        this.exceptions = {
            'CallExpression': false,
            'ArrayExpression': false,
            'Property': false
        };

        var optionName = this.getOptionName();

        if (typeof value === 'object') {
            assert(Array.isArray(value.allExcept), optionName + ' option requires "allExcept" ' +
                'to be an array');
            assert(value.allExcept.length > 0, optionName + ' option requires "allExcept" ' +
                'to have at least one item or be set to `true`');

            value.allExcept.forEach(function(except) {
                if (except === 'inCallExpressions') {
                    this.exceptions.CallExpression = true;
                } else if (except === 'inArrayExpressions') {
                    this.exceptions.ArrayExpression = true;
                } else if (except === 'inProperties') {
                    this.exceptions.Property = true;
                } else {
                    assert(false, optionName + ' option requires "allExcept" to only have ' +
                        '"inCallExpressions" or "inArrayExpressions"');
                }
            }, this);
        } else {
            assert(value === true,
                optionName + ' option requires true value or object'
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

            if (isException(parentNode, this.exceptions)) {
                return;
            }

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
                    message: 'Missing newline after block'
                });

                return;
            }
        }).bind(this));
    }
};
