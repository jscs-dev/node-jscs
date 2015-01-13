/**
 * Requires sticking binary operators to the right.
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of quoted operators or `true` to disallow space after all possible binary operators
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceAfterBinaryOperators": [
 *     "=",
 *     ",",
 *     "+",
 *     "-",
 *     "/",
 *     "*",
 *     "==",
 *     "===",
 *     "!=",
 *     "!=="
 *     // etc
 * ]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * x +y;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * x+ y;
 * ```
 */

var assert = require('assert');
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

        // Comma
        if (operators[',']) {
            file.iterateTokensByType('Punctuator', function(token) {
                if (token.value === ',') {
                    errors.assert.noWhitespaceBetween({
                        token: token,
                        nextToken: file.getNextToken(token),
                        message: 'Operator , should stick to following expression'
                    });
                }
            });
        }

        // For everything else
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'VariableDeclarator', 'LogicalExpression'],
            function(node) {
                var operator;
                var expression;

                if (node.type === 'VariableDeclarator') {
                    expression = node.init;
                    operator = '=';
                } else {
                    operator = node.operator;
                    expression = node.right;
                }

                if (expression === null) {
                    return;
                }

                var operatorToken = file.findPrevOperatorToken(
                    file.getFirstNodeToken(expression),
                    operator
                );

                var nextToken = file.getNextToken(operatorToken);

                if (operators[operator]) {
                    errors.assert.noWhitespaceBetween({
                        token: operatorToken,
                        nextToken: nextToken,
                        message: 'Operator ' + operator + ' should stick to following expression'
                    });
                }
            }
        );
    }

};
