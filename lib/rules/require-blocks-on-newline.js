var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireBlocksOnNewline) {
        assert(
            typeof requireBlocksOnNewline === 'boolean',
            'requireBlocksOnNewline option requires boolean value'
        );
        assert(
            requireBlocksOnNewline === true,
            'requireBlocksOnNewline option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireBlocksOnNewline';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length === 0) {
                // Do not warn for empty blocks, such as empty function declarations
                return;
            }
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (openingBracket.loc.start.line === nextToken.loc.start.line) {
                errors.add('Missing newline after opening curly brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line === prevToken.loc.start.line) {
                errors.add('Missing newline before closing curly brace', prevToken.loc.end);
            }
        });
    }

};
