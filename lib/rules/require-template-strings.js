/**
 * Requires the use of template strings instead of string concatenation.
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
 * "requireTemplateStrings": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function sayHi(name) {
 *     return `How are you, ${name}?`;
 * }
 * `a ${b + c}`
 * `a ${a()}`
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function sayHi(name) {
 *     return 'How are you, ' + name + '?';
 * }
 * "a" + (b + c)
 * "a" + a()
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
        return 'requireTemplateStrings';
    },

    check: function(file, errors) {
        function add(node) {
            errors.add(
                'Illegal use of string concatenation. Use template strings instead.',
                node.left.loc.end
            );
        }

        function isString(value) {
            return typeof value === 'string';
        }

        file.iterateNodesByType('BinaryExpression', function(node) {
            if (node.operator !== '+') {
                return;
            }

            // Only one of the operands should be a string, otherwise this is not a concatenation
            if (isString(node.left.value) || isString(node.right.value)) { add(node); }
        });
    }
};
