var assert = require('assert');
var tokenHelper = require('../token-helper');
var allOperators = require('../utils').binaryOperators;

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'disallowSpaceBeforeBinaryOperators option requires array or true value'
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
        return 'disallowSpaceBeforeBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        function errorIfApplicable(token, i, tokens, operator) {
            var prevToken = tokens[i - 1];

            if (prevToken && prevToken.range[1] !== token.range[0]) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + operator + ' should stick to preceding expression',
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

                var prevToken = tokens[i - 1];

                // Do not report error if comma not on the same line with the first operand #467
                if (token.loc.start.line === prevToken.loc.start.line) {
                    errorIfApplicable(token, i, tokens, operator);
                }
            });
        }

        // For everything else
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'VariableDeclarator', 'LogicalExpression'],
            function(node) {
                var isDec = node.type === 'VariableDeclarator';
                var operator = isDec ? '=' : node.operator;

                // !node.init is it's an empty assignment
                if (!operators[operator] || node.init === null) {
                    return;
                }

                var range = (isDec ? node.id : node.left).range;
                var part = tokenHelper.getTokenByRangeStartIfPunctuator(file, range[1], operator);

                if (!part) {
                    errors.add(
                        'Operator ' + node.operator + ' should stick to preceding expression',
                        tokenHelper.findOperatorByRangeStart(
                            file, range[0], operator
                        ).loc.start
                    );
                }
            }
        );
    }

};
