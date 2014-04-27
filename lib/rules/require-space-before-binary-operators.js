var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

/**
 * @rule Require space before binary operators
 * @description
 * Disallows sticking binary operators to the left.
 *
 * Type: `Array`
 *
 * Values: Array of quoted operators
 *
 * @example <caption>Example:</caption>
 * "requireSpaceBeforeBinaryOperators": [
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
 * x !== y;
 * @example <caption>Invalid:</caption>
 * x!== y;
 */
module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'requireSpaceBeforeBinaryOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceBeforeBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        // 2 + 2, 2 == 2
        file.iterateNodesByType(['BinaryExpression'], function(node) {
            if (operators[node.operator]) {
                // get token after left part of expression
                var tokenAfterLeftPart = tokenHelper.getTokenByRangeStart(file, node.left.range[1]);

                if (tokenHelper.tokenIsPunctuator(tokenAfterLeftPart, node.operator)) {
                    errors.add(
                        'Operator ' + node.operator + ' should not stick to preceding expression',
                        tokenAfterLeftPart.loc.start
                    );
                }
            }
        });
    }

};
