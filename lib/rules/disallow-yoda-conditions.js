/**
 * Requires the variable to be the left hand operator when doing a boolean comparison
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowYodaConditions": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (a == 1) {
 *     return
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (1 == a) {
 *     return
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
        this._operatorIndex = {
            '==': true,
            '===': true,
            '!=': true,
            '!==': true,
            '>': true,
            '<': true,
            '>=': true,
            '<=': true
        };
    },

    getOptionName: function() {
        return 'disallowYodaConditions';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;
        file.iterateNodesByType('BinaryExpression', function(node) {
            if (operators[node.operator]) {
                if (node.left.type === 'Literal' ||
                    (node.left.type === 'Identifier' && node.left.name === 'undefined')
                ) {
                    errors.add('Yoda condition', node.left.loc.start);
                }
            }
        });
    }

};
