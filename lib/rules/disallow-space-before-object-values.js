var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallow) {
        assert(
            typeof disallow === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            disallow === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeObjectValues';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                var value = property.value;
                var valuePos = file.getTokenPosByRangeStart(value.range[0]);
                var colon = tokens[valuePos - 1];
                if (colon.range[1] !== value.range[0]) {
                    errors.add('Illegal space after key colon', colon.loc.end);
                }
            });
        });
    }

};
