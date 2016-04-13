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
                        'one of "inCallExpressions", "inNewExpressions",' +
                        '"inArrayExpressions", "inProperties" or "singleLine"');
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
        function isException(node, parent, exceptions) {
            var grandpa = parent.parentElement;

            // Check if this block is used in call or array expression
            if (grandpa && exceptions[grandpa.type]) {
                return true;
            }

            var first = node.getFirstToken();
            var last = node.getLastToken();

            if (exceptions.SingleLine && file.isOnTheSameLine(first, last)) {
                return true;
            }

            return false;
        }

        file.iterateNodesByType('BlockStatement', (function(node) {

            var endToken = file.getLastNodeToken(node);
            var parentElement = node.parentElement;
            var tokens = {
                next: endToken.getNextCodeToken(),
                token: endToken
            };

            if (isException(node, parentElement, this.exceptions)) {
                return;
            }

            while (tokens.next.type !== 'EOF') {
                var excludeValues = excludes[parentElement.type];
                if (excludeValues && excludeValues.indexOf(tokens.next.value) !== -1) {
                    return;
                }

                if (file.isOnTheSameLine(tokens.token, tokens.next)) {
                    endToken = tokens.next;
                    tokens.next = tokens.next.getNextCodeToken();
                    continue;
                }

                if (tokens.next.type === 'Punctuator' && (
                    tokens.next.value === '}' ||
                    tokens.next.value === ']' ||
                    tokens.next.value === '>' ||
                    tokens.next.value === ')')
                ) {
                    return;
                }

                errors.assert.linesBetween({
                    token: tokens.token,
                    nextToken: tokens.next,
                    atLeast: 2,
                    message: 'Missing newline after block'
                });

                return;
            }
        }).bind(this));
    }
};
