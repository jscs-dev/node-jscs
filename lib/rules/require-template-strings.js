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
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function sayHi(name) {
 *     return 'How are you, ' + name + '?';
 * }
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
        file.iterateNodesByType('BinaryExpression', function(node) {
            if (node.operator !== '+') {
                return;
            }

            if (node.left.type === 'Literal' && node.right.type === 'Identifier' ||
                node.right.type === 'Literal' && node.left.type === 'Identifier') {
                errors.add(
                    'Illegal use of string concatenation. Use template strings instead.',
                    node.left.loc.end
                );
            }
        });
    }
};
