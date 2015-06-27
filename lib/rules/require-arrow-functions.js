/**
 * Requires that arrow functions are used instead of anonymous function expressions in callbacks.
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
 * // function expression in a return statement
 * function a(x) {
 *     return function(x) { return x };
 * };
 * // function expression in a variable declaration
 * var a = function(x) { return x };
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * // function expression in a callback
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
            // only check call expressions
            // due to issues with this in other cases
            if (node.parentNode.type === 'CallExpression') {
                errors.add('Use arrow functions instead of function expressions', node.loc.start);
            }
        });
    }
};
