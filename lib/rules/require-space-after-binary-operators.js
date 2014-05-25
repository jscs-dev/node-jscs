var assert = require('assert');
var tokenHelper = require('../token-helper');
var allOperators = require('../utils').binaryOperators;

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'requireSpaceAfterBinaryOperators option requires array or true value'
        );

        if (isTrue) {
            operators = allOperators;
        }

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

        function errorIfApplicable(token, i, tokens, operator) {
            var nextToken = tokens[i + 1];

            if (token && nextToken && nextToken.range[0] === token.range[1]) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + operator + ' should not stick to following expression',
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

                    errorIfApplicable(token, tokens.indexOf(token), tokens, ':');
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

                errorIfApplicable(token, i, tokens, operator);
            });
        }

        // For everything else
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'LogicalExpression'],
            function(node) {
                if (operators[node.operator]) {
                    var indent;
                    var range = node.right.range[0];

                    if (tokenHelper.isTokenParenthesis(file, range - 1, true)) {
                        indent = node.operator.length + 1;
                    } else {
                        indent = node.operator.length;
                    }

                    var part = tokenHelper.getTokenByRangeStartIfPunctuator(
                        file,
                        range - indent,
                        node.operator,
                        true
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
    }

};
