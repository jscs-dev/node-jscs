var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), this.getOptionName() + ' option requires array value');
        this._operators = operators.slice(0);
    },

    getOptionName: function () {
        return 'disallowSpaceBeforePostfixUnaryOperators';
    },

    check: function(file, errors) {

        var operators = this._operators;

        // 'UpdateExpression' involve only ++ and -- operators
        file.iterateNodesByType('UpdateExpression', function (node) {

            // "!node.prefix" means postfix type of (inc|dec)rement
            if (!node.prefix && operators.indexOf(node.operator) !== -1) {

                // Length of operator is always 2
                if (node.argument.range[1] < (node.range[1] - 2)) {
                    errors.add('Operator ' + node.operator + ' should stick to operand', node.loc.start);
                }
            }
        });
    }
};
