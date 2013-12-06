var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), this.getOptionName() + ' option requires array value');
        this._operators = operators.slice(0);
    },

    getOptionName: function () {
        return 'requireSpaceBeforePostfixUnaryOperators';
    },

    check: function(file, errors) {

        var source = file.getSource(),
            operators = this._operators;

        // Postfix unary operators involve only ++ and --, so we check only 'UpdateExpressions'
        file.iterateNodesByType('UpdateExpression', function (node) {

            // "!node.prefix" means postfix type of (inc|dec)rement
            if (!node.prefix && operators.indexOf(node.operator) !== -1) {

                // Length of operator is always 2, so we need to move 3 to the left
                if (source.charAt(node.range[1] - 3) !== ' ') {
                    errors.add('Operator ' + node.operator + ' should not stick to operand', {
                        line: node.loc.end.line,
                        column: node.loc.end.column - 3
                    });
                }
            }
        });
    }
};
