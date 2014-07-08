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
            ['BinaryExpression', 'AssignmentExpression', 'VariableDeclarator', 'LogicalExpression'],
            function(node) {
                var isDec = node.type === 'VariableDeclarator';
                var operator = isDec ? '=' : node.operator;

                if (!operators[operator] || node.init === null) {
                    return;
                }

                var range = (isDec ? node.init : node.right).range[0];

                var indent = tokenHelper.isTokenParenthesis(file, range - 1, true) ?
                    operator.length + 1 :
                    operator.length;

                var part = tokenHelper.getTokenByRangeStartIfPunctuator(
                    file,
                    range - indent,
                    operator,
                    true
                );

                if (part) {
                    var loc = part.loc.start;

                    errors.add(
                        'Operator ' + operator + ' should not stick to following expression',
                        loc.line,
                        tokenHelper.getPointerEntities(loc.column, operator.length)
                    );
                }
            }
        );
    },

    format: function(file, error) {
        var tokens = file.getTokens();
        var pos = file.getPosByLineAndColumn(error.line, error.column);
        var operatorTokenIndex = file.getTokenPosByRangeStart(pos);
        var nextToken = tokens[operatorTokenIndex + 1];
        file.splice(nextToken.range[0], 0, ' ');
    }

};
