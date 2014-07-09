var assert = require('assert');
var tokenHelper = require('../token-helper');
var allOperators = require('../utils').binaryOperators;

module.exports = function() {};

module.exports.prototype = {
    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'disallowSpaceAfterBinaryOperators option requires array or true value'
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
        return 'disallowSpaceAfterBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        function errorIfApplicable(token, i, tokens, operator) {
            var nextToken = tokens[i + 1];

            if (nextToken && nextToken.range[0] !== token.range[1]) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + operator + ' should stick to following expression',
                    loc.line,
                    tokenHelper.getPointerEntities(loc.column, token.value.length)
                );
            }
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

                if (!part) {
                    var loc = tokenHelper.findOperatorByRangeStart(
                        file, range, operator, true
                    ).loc.start;

                    errors.add(
                        'Operator ' + operator + ' should stick to following expression',
                        loc.line,
                        tokenHelper.getPointerEntities(loc.column, operator.length)
                    );
                }
            }
        );
    }

};
