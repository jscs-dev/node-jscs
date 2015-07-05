/**
 * Requires the variable to be the right hand operator when doing a boolean comparison
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of quoted operators or `true` to require yoda conditions for most possible comparison operators
 *
 * #### Example
 *
 * ```js
 * "requireYodaConditions": [
 *     "==",
 *     "===",
 *     "!=",
 *     "!=="
 * ]
 * ```
 *
 * ##### Valid
 * ```js
 * if (1 == a) {
 *     return
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (a == 1) {
 *     return
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            this.getOptionName() + ' option requires array or true value'
        );

        if (isTrue) {
            operators = ['==', '===', '!=', '!=='];
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireYodaConditions';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;
        file.iterateNodesByType('BinaryExpression', function(node) {
            if (operators[node.operator]) {
                if (node.right.type === 'Literal' ||
                    (node.right.type === 'Identifier' && node.right.name === 'undefined')
                ) {
                    errors.add('Not yoda condition', node.left.loc.start);
                }
            }
        });
    }

};
