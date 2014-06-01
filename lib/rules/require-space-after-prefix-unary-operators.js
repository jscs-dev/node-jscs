var assert = require('assert');
var defaultOperators = require('../utils').unaryOperators;

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
        return 'requireSpaceAfterPrefixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        file.iterateNodesByType(['UnaryExpression', 'UpdateExpression'], function(node) {
            // Check "node.prefix" for prefix type of (inc|dec)rement
            if (node.prefix && operatorIndex[node.operator]) {
                var argument = node.argument.type;
                var operatorTokenIndex = file.getTokenPosByRangeStart(node.range[0]);
                var operatorToken = tokens[operatorTokenIndex];
                var nextToken = tokens[operatorTokenIndex + 1];

                // Do not report consecutive operators (#405)
                if (
                    argument === 'UnaryExpression' || argument === 'UpdateExpression' &&
                    nextToken.value !== '('
                ) {
                    return;
                }

                if (operatorToken.range[1] === nextToken.range[0]) {
                    errors.add('Operator ' + node.operator + ' should not stick to operand', node.loc.start);
                }
            }
        });
    }
};
