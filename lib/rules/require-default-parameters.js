/**
 * Requires use of default parameters instead of checking for undefined in the function body
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
 * "requireDefaultParameters": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function multiply(a, b = 1) {}
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function multiply(a, b) { b = b || 1; }
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
        return 'requireDefaultParameters';
    },

    check: function(file, errors) {
        file.iterateNodesByType('AssignmentExpression', function(node) {
            var left = node.left;
            var right = node.right;
            if (
                // b = b || 1
                right.type === 'LogicalExpression' &&
                left.type === 'Identifier' && right.left.type === 'Identifier' &&
                left.name === right.left.name ||

                // b = typeof b !== 'undefined' ? b : 1
                right.type === 'ConditionalExpression' &&
                right.test.type === 'BinaryExpression' &&
                right.test.left.type === 'UnaryExpression' && right.test.left.operator === 'typeof' &&
                right.test.right.type === 'Literal' && right.test.right.value === 'undefined' &&
                left.type === 'Identifier' && right.consequent.type === 'Identifier' &&
                right.test.left.argument.type === 'Identifier' &&
                left.name === right.consequent.name &&
                left.name === right.test.left.argument.name
            ) {
                errors.add(
                    'Use default parameters instead of checking for undefined',
                    node.loc.start.line,
                    node.loc.start.column
                );
            }
        });
    }

};
