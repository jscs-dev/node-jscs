var assert = require('assert');
var tokenHelper = require('../token-helper');
var allOperators = require('../../lib/utils').binaryOperators.filter(function(operator) {
    return operator !== ',';
});

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'requireSpaceBeforeBinaryOperators option requires array or true value'
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
        return 'requireSpaceBeforeBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

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

                if (!operators[operator]) {
                    return;
                }

                var range = (isDec ? node.id : node.left).range[1];
                var part = tokenHelper.getTokenByRangeStartIfPunctuator(file, range, operator);

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
    }

};
