/**
 * Requires space before keyword.
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of quoted keywords or `true` to require all possible keywords to have a preceding space.
 *
 * #### Example
 *
 * ```js
 * "requireSpaceBeforeKeywords": [
 *     "else",
 *     "while",
 *     "catch"
 * ]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * } else {
 *     x++;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * }else {
 *     x++;
 * }
 * ```
 */

var assert = require('assert');
var util = require('util');
var texts = [
    'Missing space before "%s" keyword',
    'Should be one space instead of %d, before "%s" keyword'
];

var defaultKeywords = require('../utils').spacedKeywords;

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(
            Array.isArray(keywords) || keywords === true,
            'requireSpaceAfterKeywords option requires array or true value');

        if (keywords === true) {
            keywords = defaultKeywords;
        }

        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceBeforeKeywords';
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
                var prevToken = tokens[i - 1];
                if (!prevToken) {
                    return;
                }

                var comment = getCommentIfExists(prevToken.range[1], token.range[0]);
                prevToken = comment || prevToken;

                var diff = token.range[0] - prevToken.range[1];

                if (prevToken.loc.end.line === token.loc.start.line && diff !== 1) {
                    if (prevToken.type !== 'Punctuator' || prevToken.value !== ';') {
                        errors.add(
                            util.format.apply(null,
                                diff === 0 ?
                                    [texts[0], token.value] :
                                    [texts[1], diff, token.value]
                            ),
                            token.loc.start.line,
                            token.loc.start.column
                        );
                    }
                }
            }
        });
    }

};
