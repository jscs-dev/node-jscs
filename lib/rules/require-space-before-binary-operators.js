var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

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
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'LogicalExpression'],
            function(node) {
                if (operators[node.operator]) {
                    var part = tokenHelper.getTokenByRangeStartIfPunctuator(
                        file,
                        node.left.range[1],
                        node.operator
                    );

                    if (part) {
                        var loc = part.loc.start;
                        errors.add(
                            'Operator ' + node.operator + ' should not stick to following expression',
                            loc.line,
                            tokenHelper.getPointerEntities(loc.column, node.operator.length)
                        );
                    }
                }
            }
        );

        function errorIfApplicable(token, i, tokens, operator) {
            var prevToken = tokens[i - 1];

            if (prevToken && prevToken.range[1] === token.range[0]) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + operator + ' should not stick to preceding expression',
                    loc.line,
                    tokenHelper.getPointerEntities(loc.column, token.value.length)
                );
            }
        }

        // ":" for object property only but not for ternar
        if (operators[':']) {
            file.iterateNodesByType(['ObjectExpression'], function(node) {
                node.properties.forEach(function(prop) {
                    var token = tokenHelper.findOperatorByRangeStart(file, prop.range[0], ':'),
                        tokens = file.getTokens();

                    errorIfApplicable(token, tokens.indexOf( token ), tokens, ':');
                });
            });
        }

        // Comma
        if (operators[',']) {
            file.iterateTokensByType('Punctuator', function(token, i, tokens) {
                var operator = token.value;
                if (operator !== ',') {
                    return;
                }

                errorIfApplicable( token, i, tokens, operator );
            });
        }
    }

};
