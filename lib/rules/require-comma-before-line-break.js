var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireCommaBeforeLineBreak) {
        assert(
            typeof requireCommaBeforeLineBreak === 'boolean',
            'requireCommaBeforeLineBreak option requires boolean value'
        );
        assert(
            requireCommaBeforeLineBreak === true,
            'requireCommaBeforeLineBreak option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Punctuator', function(token) {
            if (token.value === ',') {
                errors.assert.sameLine({
                    token: file.getPrevToken(token),
                    nextToken: token,
                    message: 'Commas should not be placed on new line'
                });
            }
        });
    }

};
