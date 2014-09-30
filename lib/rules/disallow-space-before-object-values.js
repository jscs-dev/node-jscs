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
        return 'disallowSpaceBeforeObjectValues';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                var keyToken = file.getTokenByRangeStart(property.key.range[0]);
                var valueToken = file.getTokenByRangeStart(property.value.range[0]);
                var colon = file.findNextToken(keyToken, 'Punctuator', ':');
                var tokenBeforeValue = file.getPrevToken(valueToken);

                var tokenToTest;
                if (tokenHelper.isTokenParenthesis(file, tokenBeforeValue.range[0], true)) {
                    // skip '(' if value is parenthesised
                    tokenToTest = tokenBeforeValue;
                } else {
                    tokenToTest = valueToken;
                }

                if (colon.range[1] !== tokenToTest.range[0]) {
                    errors.add('Illegal space after key colon', colon.loc.end);
                }
            });
        });
    }

};
