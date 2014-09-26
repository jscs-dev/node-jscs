var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireSpacesInCallExpression) {
        assert(
            requireSpacesInCallExpression === true,
            'requireSpacesInCallExpression option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSpacesInCallExpression';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();

        file.iterateNodesByType('CallExpression', function(node) {
            var nodeBeforeRoundBrace = node;
            if (node.callee) {
                nodeBeforeRoundBrace = node.callee;
            }

            var functionToken = file.getTokenByRangeStart(nodeBeforeRoundBrace.range[0]);
            var roundBraceToken = file.findNextToken(functionToken, null, '(');
            var functionEndToken = file.getPrevToken(roundBraceToken);

            if (roundBraceToken.value === '(' && functionEndToken.range[1] === roundBraceToken.range[0]) {
                errors.add(
                    'Missing space before opening round brace',
                    roundBraceToken.loc.start
                );
            }
        });
    }
};
