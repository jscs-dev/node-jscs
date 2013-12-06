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

        var source = file.getSource(),
            operators = this._operators;

        file.iterateNodesByType(['UnaryExpression', 'UpdateExpression'], function (node) {

            // "node.prefix" means prefix type of (inc|dec)rement
            if (node.prefix && operators.indexOf(node.operator) !== -1) {

                if (source.charAt(node.range[0] + node.operator.length) !== ' ') {
                    errors.add('Operator ' + node.operator + ' should not stick to operand', {
                        line: node.loc.start.line,
                        column: node.loc.start.column + node.operator.length
                    });
                }
            }
        });
    }
};
