var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

/**
 * @rule Disallow space after binary operators
 * @description
 * Requires sticking binary operators to the right.
 *
 * Type: `Array`
 *
 * Values: Array of quoted operators
 *
 * @example <caption>Example:</caption>
 * "disallowSpaceAfterBinaryOperators": [
 *     "+",
 *     "-",
 *     "/",
 *     "*",
 *     "=",
 *     "==",
 *     "===",
 *     "!=",
 *     "!=="
 * ]
 * @example <caption>Valid:</caption>
 * x +y;
 * @example <caption>Invalid:</caption>
 * x+ y;
 */
module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowSpaceAfterBinaryOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpaceAfterBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        // 2 + 2, 2 == 2
        file.iterateNodesByType(['BinaryExpression'], function(node) {
            if (operators[node.operator]) {
                // get token before right part of expression
                var tokenBeforeRightPart = tokenHelper.getTokenByRangeStart(file, node.right.range[0] - 1, true);

                if (!tokenHelper.tokenIsPunctuator(tokenBeforeRightPart, node.operator)) {
                    errors.add(
                        'Operator ' + node.operator + ' should stick to following expression',
                        node.right.loc.start
                    );
                }
            }
        });
    }

};
