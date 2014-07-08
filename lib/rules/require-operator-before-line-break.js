var assert = require('assert');
var tokenHelper = require('../token-helper');
var defaultOperators = require('../utils').binaryOperators.slice();

defaultOperators.push('?');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'requireOperatorBeforeLineBreak option requires array value or true value'
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
        return 'requireOperatorBeforeLineBreak';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;
        var tokens = file.getTokens();
        var throughTokens = ['?', ','];

        function errorIfApplicable(token, i, tokens) {
            var prevToken = tokens[i - 1];

            if (prevToken && prevToken.loc.end.line !== token.loc.start.line) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + token.value + ' should not be on a new line',
                    loc.line,
                    tokenHelper.getPointerEntities(loc.column, token.value.length)
                );
            }
        }

        throughTokens = throughTokens.filter(function(operator) {
            return operators[operator];
        });

        if (throughTokens.length) {
            file.iterateTokensByType('Punctuator', function(token, i, tokens) {
                var operator = token.value;

                if (throughTokens.every(function() {
                    return throughTokens.indexOf(operator) >= 0;
                })) {
                    errorIfApplicable(token, i, tokens, operator);
                }
            });
        }

        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'LogicalExpression'],
            function(node) {
                var operator = node.operator;

                if (!operators[operator]) {
                    return;
                }

                var token = tokenHelper.findOperatorByRangeStart(
                    file,
                    node.left.argument ? node.left.argument.range[0] : node.left.range[0],
                    operator
                );

                errorIfApplicable(
                    token,
                    tokens.indexOf(token),
                    tokens
                );
            }
        );
    }
};
