var assert = require('assert');
var util = require('util');
var texts = [
    'Missing space after "%s" keyword',
    'Should be one space instead of %d, after "%s" keyword'
];

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'requireSpaceAfterKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceAfterKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        function getCommentIfExists(start, end) {
            return file.getComments().filter(function(comment) {
                return start <= comment.range[0] && end >= comment.range[1];
            })[0];
        }

        file.iterateTokensByType(['Keyword'], function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var nextToken = tokens[i + 1];
                var comment = getCommentIfExists(token.range[1], nextToken.range[0]);
                nextToken = comment || nextToken;

                var diff = nextToken.range[0] - token.range[1];

                if (nextToken &&
                    nextToken.loc.end.line === token.loc.start.line &&
                    diff !== 1
                ) {
                    if (nextToken.type !== 'Punctuator' || nextToken.value !== ';') {
                        errors.add(
                            util.format.apply(null,
                                diff === 1 ?
                                    [texts[0], token.value] :
                                    [texts[1], diff, token.value]
                            ),
                            nextToken.loc.start.line,
                            nextToken.loc.start.column
                        );
                    }
                }
            }
        });
    }

};
