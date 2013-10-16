var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSpacesInsideParentheses) {
        assert(
            typeof disallowSpacesInsideParentheses === 'boolean',
            'disallowSpacesInsideParentheses option requires boolean value'
        );
        assert(
            disallowSpacesInsideParentheses === true,
            'disallowSpacesInsideParentheses option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpacesInsideParentheses';
    },

    check: function(file, errors) {

        var tokens = file.getTokens();

        tokens.forEach(function(token, index) {

            if (token.type === 'Punctuator') {

                if (token.value === '(') {
                    var nextToken = tokens[index + 1];
                    if (token.range[1] !== nextToken.range[0] &&
                            token.loc.end.line === nextToken.loc.start.line) {
                        errors.add('Illegal space after opening round bracket', token.loc.end);
                    }
                }

                if (token.value === ')') {
                    var prevToken = tokens[index - 1];
                    if (prevToken.range[1] !== token.range[0] &&
                            prevToken.loc.end.line === token.loc.start.line) {
                        errors.add('Illegal space before closing round bracket', prevToken.loc.end);
                    }
                }

            }

        });

    }

};
