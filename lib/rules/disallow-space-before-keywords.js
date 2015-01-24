/**
 * Disallows space before keyword.
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of quoted keywords or `true` to disallow spaces before all possible keywords.
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceBeforeKeywords": [
 *     "else",
 *     "catch"
 * ]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * }else {
 *     y--;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * } else {
 *     y--;
 * }
 * ```
 */

var assert = require('assert');
var util = require('util');
var texts = [
    'Illegal space before "%s" keyword',
    'Should be zero spaces instead of %d, before "%s" keyword'
];

var defaultKeywords = require('../utils').spacedKeywords;

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(
            Array.isArray(keywords) || keywords === true,
            'disallowSpaceBeforeKeywords option requires array or true value');

        if (keywords === true) {
            keywords = defaultKeywords;
        }

        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType(['Keyword'], function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var prevToken = file.getPrevToken(token);
                if (!prevToken) {
                    return;
                }

                prevToken = file.getCommentBeforeToken(token) || prevToken;

                var diff = token.range[0] - prevToken.range[1];

                if (prevToken.loc.end.line === token.loc.start.line && diff !== 0) {
                    if (prevToken.type !== 'Punctuator' || prevToken.value !== ';') {
                        errors.add(
                            util.format.apply(null,
                                diff === 1 ?
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
