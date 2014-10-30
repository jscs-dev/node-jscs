var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowSemicolons) {
        assert(
            disallowSemicolons === true,
            'disallowSemicolons option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSemicolons';
    },

    check: function(file, errors) {
        file.getTokens()
            .filter(function(token) {
                return token.type === 'Punctuator' && token.value === ';';
            })
            .forEach(function(token) {
                var nextToken = file.getNextToken(token);
                // disallow end-of-line semicolons
                if (!nextToken || nextToken.loc.end.line > token.loc.end.line) {
                    errors.add('Semicolons are disallowed', token.loc.end);
                }
            });
    }
};
