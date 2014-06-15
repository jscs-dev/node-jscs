var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireYodaConditions) {
        assert(
            typeof requireYodaConditions === 'boolean',
            'requireYodaConditions option requires boolean value'
        );
        assert(
            requireYodaConditions === true,
            'requireYodaConditions option requires true value or should be removed'
        );
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

    getOptionName: function() {
        return 'requireYodaConditions';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;
        file.iterateNodesByType('BinaryExpression', function(node) {
            if (operators[node.operator]) {
                if (node.right.type === 'Literal' ||
                    (node.right.type === 'Identifier' && node.right.name === 'undefined')
                ) {
                    errors.add('Not yoda condition', node.left.loc.start);
                }
            }
        });
    }

};
