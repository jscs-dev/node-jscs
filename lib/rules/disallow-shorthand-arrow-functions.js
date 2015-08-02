/**
 * Require arrow functions to use a block statement (explicit return).
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
 * "disallowShorthandArrowFunctions": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * // block statement
 * evens.map(v => {
 *     return v + 1;
 * });
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * // single expression
 * evens.map(v => v + 1);
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
        return 'disallowShorthandArrowFunctions';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ArrowFunctionExpression', function(node) {
            if (node.expression) {
                errors.add(
                    'Use arrow function with explicit block and explicit return',
                    node.body.loc.start
                );
            }
        });
    }

};
