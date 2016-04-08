/**
 * Requires newline after blocks
 *
 * Type: `Boolean` or `Object`
 *
 * Values:
 * - `true`: always require a newline after blocks
 * - `Object`:
 *      - `"allExcept"`: `Array`
 *          - `"inCallExpressions"` Blocks don't need a line of padding in function argument lists
 *          - `"inNewExpressions"` Blocks don't need a line of padding in constructor argument lists
 *          - `"inArrayExpressions"` Blocks don't need a line of padding in arrays
 *          - `"inProperties"` Blocks don't need a line of padding as object properties
 *          - `"singleLine"` Blocks don't need a line of padding if they are on a single line
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewLinesAfterBlocks": true
 * "requirePaddingNewLinesAfterBlocks": {
 *     "allExcept": ["inCallExpressions", "inNewExpressions", "inArrayExpressions", "inProperties", "singleLine"]
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
 *     );
 *
 *     var a = [
 *         function() {
 *         },
 *
 *         function() {
 *         }
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
 * ##### Valid for `{ "allExcept": ["inNewExpressions"] }`
 *
 * ```js
 * new SomeClass(
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
 * ##### Valid for `{ "allExcept": ["singleLine"] }`
 * ```js
 * for (var i = 0; i < 10; ++i) {
 *     if (i % 2 === 0) { continue; }
 *     console.log('Its getting odd in here...');
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
    'ArrowFunctionExpression': [')']
};

function isException(node, parent, exceptions) {
    var grandpa = parent.parentElement;

    // Check if this block is used in call or array expression
    if (grandpa && exceptions[grandpa.type]) {
        return true;
    }

    if (exceptions.SingleLine && (node.loc.start.line === node.loc.end.line)) {
        return true;
    }

    return false;
}

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        this.exceptions = {
            'CallExpression': false,
            'NewExpression': false,
            'ArrayExpression': false,
            'ObjectProperty': false,
            'SingleLine': false
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
                } else if (except === 'inNewExpressions') {
                    this.exceptions.NewExpression = true;
                } else if (except === 'inArrayExpressions') {
                    this.exceptions.ArrayExpression = true;
                } else if (except === 'inProperties') {
                    this.exceptions.ObjectProperty = true;
                } else if (except === 'singleLine') {
                    this.exceptions.SingleLine = true;
                } else {
                    assert(false, optionName + ' option requires "allExcept" to only have ' +
                        'one of "inCallExpressions", "inNewExpressions", "inArrayExpressions", "inProperties" or "singleLine"');
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

            var endToken = file.getLastNodeToken(node);
            var parentElement = node.parentElement;

            if (isException(node, parentElement, this.exceptions)) {
                return;
            }

            var nextToken = file.getNextToken(endToken);

            while (nextToken.type !== 'EOF') {
                var excludeValues = excludes[parentElement.type];
                if (excludeValues && excludeValues.indexOf(nextToken.value) !== -1) {
                    return;
                }

                if (endToken.loc.end.line === nextToken.loc.start.line) {
                    endToken = nextToken;
                    nextToken = file.getNextToken(nextToken);
                    continue;
                }

                if (nextToken.type === 'Punctuator' && (
                    nextToken.value === '}' ||
                    nextToken.value === ']' ||
                    nextToken.value === '>' ||
                    nextToken.value === ')')
                ) {
                    return;
                }

                errors.assert.linesBetween({
                    token: endToken,
                    nextToken: nextToken,
                    atLeast: 2,
                    message: 'Missing newline after block'
                });

                return;
            }
        }).bind(this));
    }
};
