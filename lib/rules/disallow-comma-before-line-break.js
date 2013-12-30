var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowCommaBeforeLineBreak) {
        assert(
            typeof disallowCommaBeforeLineBreak === 'boolean',
            'disallowCommaBeforeLineBreak option requires boolean value'
        );
        assert(
            disallowCommaBeforeLineBreak === true,
            'disallowCommaBeforeLineBreak option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'disallowCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        for (var i = 0, l = tokens.length; i < l; i++) {
            var token = tokens[i];
            if (token.type === 'Punctuator' && token.value === ',') {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.loc.start.line !== token.loc.end.line) {
                    errors.add(
                        'Commas should be placed on new line',
                        token.loc.end.line,
                        token.loc.end.column
                    );
                }
            }
        }
    }

};
