var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowSpaceBeforeBinaryOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        // 2 + 2, 2 == 2
        file.iterateNodesByType(['BinaryExpression'], function(node) {
            if (operators[node.operator]) {
                // get token after left part of expression
                var tokenAfterLeftPart = tokenHelper.getTokenByRangeStart(file, node.left.range[1]);

                if (!tokenHelper.tokenIsPunctuator(tokenAfterLeftPart, node.operator)) {
                    errors.add(
                        'Operator ' + node.operator + ' should stick to following expression',
                        node.left.loc.start
                    );
                }
            }
        });
    }

};
