/**
 * Requires that arrow functions are used instead of anonymous function expressions.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * Version: `ES6`
 *
 * #### Example
 *
 * ```js
 * "requireArrowFunctions": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * // arrow function
 * [1, 2, 3].map((x) => {
 *     return x * x;
 * });
 * // function declaration
 * function a(n) { return n + 1; }
 * // getter/setter
 * var x = { get y() {}, set y(y) {} }
 * // object shorthand
 * var x = { bar() {} }
 * // class method
 * class Foo { bar() {} }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * [1, 2, 3].map(function (x) {
 *     return x * x;
 * });
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireArrowFunctions';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['FunctionExpression'], function(node) {
            if (node.parentNode && (
                // exception for object shorthand methods
                node.parentNode.method === true ||
                // exception for class methods
                node.parentNode.type === 'MethodDefinition' ||
                // exception for getter
                node.parentNode.kind === 'get' ||
                // exception for setter
                node.parentNode.kind === 'set')
            ) {
                return;
            }
            errors.add('Use arrow functions instead of function expressions', node.loc.start);
        });
    }
};
