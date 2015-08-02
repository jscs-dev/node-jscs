/**
 * Disallows arrow functions.
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
 * "disallowArrowFunctions": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * // function expression in a callback
 * [1, 2, 3].map(function (x) {
 *     return x * x;
 * });
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * // arrow function
 * [1, 2, 3].map((x) => {
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
        return 'disallowArrowFunctions';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['ArrowFunctionExpression'], function(node) {
            errors.add('Do not use arrow functions', node.loc.start);
        });
    }
};
