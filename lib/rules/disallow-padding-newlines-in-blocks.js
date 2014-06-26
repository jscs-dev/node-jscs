var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowPaddingNewlinesInBlocks) {
        assert(
            disallowPaddingNewlinesInBlocks === true,
            'disallowPaddingNewlinesInBlocks option requires the value true or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowPaddingNewlinesInBlocks';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        var tokens = file.getTokens();

        file.iterateNodesByType('BlockStatement', function(node) {
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);
            var openingBracket = tokens[openingBracketPos];
            var startLine = openingBracket.loc.start.line;

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var closingLine = closingBracket.loc.start.line;

            if (startLine === closingLine) {
                return;
            }

            if (lines[startLine] === '') {
                errors.add('Expected no padding newline after opening curly brace', openingBracket.loc.end);
            }

            if (lines[closingLine - 2] === '') {
                errors.add('Expected no padding newline before closing curly brace', closingBracket.loc.start);
            }
        });
    }

};
