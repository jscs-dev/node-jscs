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

    getOptionName: function () {
        return 'requireCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        for (var i = 0, l = tokens.length; i < l; i++) {
            var token = tokens[i];
            if (token.type === 'Punctuator' && token.value === ',') {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.loc.end.line !== token.loc.start.line) {
                    errors.add(
                        'Commas should not be placed on new line',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        }
    }

};
