var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireSpacesInCallExpression) {
        assert(
            typeof requireSpacesInCallExpression === 'boolean',
            'disallowSpacesInCallExpression option requires boolean value'
        );
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
            var parent = node.parentNode;

            var nodeBeforeRoundBrace = node;
            // named function
            if (node.id) {
                nodeBeforeRoundBrace = node.id;
            }

            var functionTokenPos = file.getTokenPosByRangeStart(nodeBeforeRoundBrace.range[0]);
            var functionToken = tokens[functionTokenPos];

            var tokenPos = functionTokenPos;
            var nextToken = {};
            var prevToken = functionToken;
            do {
                prevToken = tokens[tokenPos];
                tokenPos++;
                nextToken = tokens[tokenPos];
            } while (nextToken && (nextToken.type !== 'Punctuator' || nextToken.value !== '('));

            if (nextToken && prevToken.range[1] !== nextToken.range[0]) {
                errors.add(
                    'Illegal space before opening round brace',
                    nextToken.loc.start
                );
            }
        });
    }
};
