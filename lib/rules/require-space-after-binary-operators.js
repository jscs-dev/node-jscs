var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'requireSpaceAfterBinaryOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceAfterBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        // 2 + 2, 2 == 2
        file.iterateNodesByType(['BinaryExpression'], function(node) {
            if (operators[node.operator]) {
                var part = tokenHelper.checkIfPunctuator(
                    file,
                    node.right.range[0] - 1,
                    node.operator,
                    true
                );

                if (part) {
                    errors.add(
                        'Operator ' + node.operator + ' should not stick to following expression',
                        part.loc.start
                    );
                }
            }
        });

        // Comma
        if (operators[ ',' ]) {
            file.iterateTokensByType('Punctuator', function(token, i, tokens) {
                if (token.value !== ',') {
                    return;
                }

                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.range[0] === token.range[1]) {
                    errors.add(
                        'Operator , should not stick to following expression',
                        token.loc.start
                    );
                }
            });
        }
    }

};
