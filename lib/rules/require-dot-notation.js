var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireDotNotation) {
        assert(
            typeof requireDotNotation === 'boolean',
            'requireDotNotation option requires boolean value'
        );
        assert(
            requireDotNotation === true,
            'requireDotNotation option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'requireDotNotation';
    },

    check: function(file, errors) {
        file.iterateNodesByType('MemberExpression', function (node) {
            if (node.computed && node.property.type === 'Literal' &&
                !tokenHelper.tokenIsReservedWord(node.property)
            ) {
                errors.add(
                    'Use dot notation instead of brackets for member expressions',
                    node.property.loc.start
                );
            }
        });
    }

};
