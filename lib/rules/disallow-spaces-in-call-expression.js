var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireSpacesInCallExpression) {
        assert(
            requireSpacesInCallExpression === true,
            'disallowSpacesInCallExpression option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpacesInCallExpression';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();

        file.iterateNodesByType('CallExpression', function(node) {
            var nodeBeforeRoundBrace = node;
            if (node.callee) {
                nodeBeforeRoundBrace = node.callee;
            }

            var roundBraceToken = file.getTokenByRangeStart(nodeBeforeRoundBrace.range[0]);
            do {
                roundBraceToken = file.findNextToken(roundBraceToken, 'Punctuator', '(');
            } while (roundBraceToken.range[0] < nodeBeforeRoundBrace.range[1]);

            var functionEndToken = file.getPrevToken(roundBraceToken);

            if (roundBraceToken.value === '(' && functionEndToken.range[1] !== roundBraceToken.range[0]) {
                errors.add(
                    'Illegal space before opening round brace',
                    roundBraceToken.loc.start
                );
            }
        });
    }
};
