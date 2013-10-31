var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), this.getOptionName() + ' option requires array value');
        this._operators = operators.slice(0);
    },

    getOptionName: function () {
        return 'requireSpaceAfterPrefixUnaryOperators';
    },

    check: function(file, errors) {

        var operators = this._operators;

        file.iterateNodesByType(['UnaryExpression', 'UpdateExpression'], function (node) {

            // Check "node.prefix" for prefix type of (inc|dec)rement
            if (node.prefix && operators.indexOf(node.operator) !== -1) {
                if ((node.range[0] + node.operator.length) === node.argument.range[0]) {
                    errors.add('Operator ' + node.operator + ' should not stick to operand', node.loc.start);
                }
            }
        });
    }
};
