/**
 * Requires using template strings instead of string concatenation.
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
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function sayHi(name) {
 *     return 'How are you, ' + name + '?';
 * }
 * "a" + (b + c)
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

        file.iterateNodesByType('BinaryExpression', function(node) {
            if (node.operator !== '+') {
                return;
            }

            // One of the operands should be a string otherwise this is not a concatination
            if (typeof node.left.value !== 'string' && typeof node.right.value !== 'string') {
                return;
            }

            // "a" + a
            if (node.right.type === 'Identifier') {
                add(node);
            }

            // a + "a"
            if (node.left.type === 'Identifier') {
                add(node);
            }

            // (a + b) + "a"
            if (node.left.type === 'BinaryExpression') {
                add(node);
            }

            // "a" + (a + b)
            if (node.right.type === 'BinaryExpression') {
                add(node);
            }
        });
    }
};
