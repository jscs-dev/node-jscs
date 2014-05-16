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

        function errorIfApplicable(token, i, tokens, operator) {
            var prevToken = tokens[i - 1];

            if (prevToken && prevToken.range[1] !== token.range[0]) {
                errors.add(
                    'Operator ' + operator + ' should stick to preceding expression',
                    token.loc.start
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

        // For everything else
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'LogicalExpression'],
            function(node) {
                if (operators[node.operator]) {
                    var part = tokenHelper.getTokenByRangeStartIfPunctuator(
                        file,
                        node.left.range[1],
                        node.operator
                    );

                    if (!part) {
                        errors.add(
                            'Operator ' + node.operator + ' should stick to preceding expression',
                            tokenHelper.findOperatorByRangeStart(
                                file, node.right.range[0], node.operator, true
                            ).loc.start
                        );
                    }
                }
            }
        );
    }

};
