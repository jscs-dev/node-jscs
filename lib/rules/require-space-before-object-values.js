var assert = require('assert');
var tokenHelper = require('../token-helper');

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
        return 'requireSpaceBeforeObjectValues';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                var value = property.value;
                var valuePos = file.getTokenPosByRangeStart(value.range[0]);
                var colon = tokens[valuePos - 1];
                if (tokenHelper.isTokenParenthesis(file, colon.range[0], true)) {
                    colon = file.getPrevToken(colon);
                }
                if (colon.range[1] === value.range[0]) {
                    errors.add('Missing space after key colon', colon.loc.end);
                }
            });
        });
    }

};
