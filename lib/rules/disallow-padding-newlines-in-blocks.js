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
        var _commentLineMap;

        function getCommentLines() {
            // builds a cache of lines with comments
            if (!_commentLineMap) {
                _commentLineMap = file.getComments().reduce(function(map, comment) {
                    for (var x = comment.loc.start.line; x <= comment.loc.end.line; x++) {
                        map[x] = 1;
                    }
                    return map;
                }, {});
            }

            return _commentLineMap;
        }

        file.iterateNodesByType('BlockStatement', function(node) {
            var tokens = file.getTokens();
            var commentLines = getCommentLines();

            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            var startLine = openingBracket.loc.start.line + 1;
            var nextLine = nextToken.loc.start.line;

            var openingComment = commentLines[startLine];
            var openingCode = nextLine - startLine < 1;
            var openingCommentOrCode = openingComment || openingCode;

            if (!openingCommentOrCode) {
                errors.add('Expected no padding newline after opening curly brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            var closingLine = closingBracket.loc.start.line;
            var prevLine = prevToken.loc.start.line + 1;

            var closingComment = commentLines[closingLine - 1];
            var closingCode = closingLine - prevLine < 1;
            var closingCommentOrCode = closingComment || closingCode;

            if (!closingCommentOrCode) {
                errors.add('Expected no padding newline before closing curly brace', prevToken.loc.end);
            }
        });
    }

};
