var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require space after prefix unary operators
 * @description
 * Disallows sticking unary operators to the right.
 *
 * Type: `Array`
 *
 * Values: Array of quoted operators
 *
 * @example <caption>Example:</caption>
 * "requireSpaceAfterPrefixUnaryOperators": ["++", "--", "+", "-", "~", "!"]
 * @example <caption>Valid:</caption>
 * x = ! y; y = ++ z;
 * @example <caption>Invalid:</caption>
 * x = !y; y = ++z;
 */
module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), this.getOptionName() + ' option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceAfterPrefixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        file.iterateNodesByType(['UnaryExpression', 'UpdateExpression'], function(node) {
            // Check "node.prefix" for prefix type of (inc|dec)rement
            if (node.prefix && operatorIndex[node.operator]) {
                var operatorTokenIndex = file.getTokenPosByRangeStart(node.range[0]);
                var operatorToken = tokens[operatorTokenIndex];
                var nextToken = tokens[operatorTokenIndex + 1];
                if (operatorToken.range[1] === nextToken.range[0]) {
                    errors.add('Operator ' + node.operator + ' should not stick to operand', node.loc.start);
                }
            }
        });
    }
};
