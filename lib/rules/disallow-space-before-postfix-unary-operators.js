var assert = require('assert');
var defaultOperators = require('../utils').incrementAndDecrementOperators;

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            this.getOptionName() + ' option requires array or true value'
        );

        if (isTrue) {
            operators = defaultOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpaceBeforePostfixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        // 'UpdateExpression' involve only ++ and -- operators
        file.iterateNodesByType('UpdateExpression', function(node) {
            // "!node.prefix" means postfix type of (inc|dec)rement
            if (!node.prefix && operatorIndex[node.operator]) {
                var operatorStartPos = node.range[1] - node.operator.length;
                var operatorTokenIndex = file.getTokenPosByRangeStart(operatorStartPos);
                var operatorToken = tokens[operatorTokenIndex];
                var prevToken = tokens[operatorTokenIndex - 1];
                if (operatorToken.range[0] !== prevToken.range[1]) {
                    errors.add('Operator ' + node.operator + ' should stick to operand', node.loc.start);
                }
            }
        });
    }
};
