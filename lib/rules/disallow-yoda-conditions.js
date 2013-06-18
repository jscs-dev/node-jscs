var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowYodaConditions) {
        assert(typeof disallowYodaConditions === 'boolean', 'disallow_multiple_var_decl option requires boolean value');
        assert(disallowYodaConditions === true, 'disallow_multiple_var_decl option requires true value or should be removed');
        this._operatorIndex = {
            '==': true,
            '===': true,
            '!=': true,
            '!==': true,
            '>': true,
            '<': true,
            '>=': true,
            '<=': true
        };
    },

    getOptionName: function () {
        return 'disallow_yoda_conditions';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;
        file.iterateNodesByType('BinaryExpression', function (node) {
            if (operators[node.operator]) {
                if (node.left.type === 'Literal' || (node.left.type === 'Identifier' && node.left.name === 'undefined')) {
                    errors.add('Yoda condition', node.left.loc.start);
                }
            }
        });
    }

};
