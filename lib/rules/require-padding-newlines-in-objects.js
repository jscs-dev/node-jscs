var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        assert(
            typeof value === 'boolean',
            'requirePaddingNewLinesInObjects option requires boolean value'
        );
        assert(
            value === true,
            'requirePaddingNewLinesInObjects option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requirePaddingNewLinesInObjects';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (nextToken.type === 'Punctuator' && nextToken.value === '}') {
                return;
            }

            if (openingBracket.loc.end.line === nextToken.loc.start.line) {
                errors.add('Missing newline after opening curly brace', nextToken.loc.start);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line === prevToken.loc.end.line) {
                errors.add('Missing newline before closing curly brace', closingBracket.loc.start);
            }
        });
    }

};
