/**
 * Requires object destructuring for multiple return values,
 * not array destructuring.
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
 * "disallowArrayDestructuringReturn": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function processInput(input) {
 *     return { left, right, top, bottom };
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function processInput(input) {
 *     return [ left, right, top, bottom ];
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
        return 'disallowArrayDestructuringReturn';
    },

    check: function(file, errors) {
        var addError = function(node) {
            errors.add(
                'Array destructuring is not allowed for return,' +
                'use object destructuring instead',
                node
            );
        };

        var isArrayDestructuring = function(node) {

            if(!node || node.type !== 'ArrayExpression' || !node.elements) {
                return false;
            }

            return node.elements.some(function(element) {
                return element.type === 'Identifier';
            });
        };

        file.iterateNodesByType('ReturnStatement', function(node) {

            if (!isArrayDestructuring(node.argument)) {
                return;
            }

            addError(node.argument);
        });
    }
};
