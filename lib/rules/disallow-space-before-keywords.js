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

        file.iterateTokensByType(['Keyword'], function(token) {
            if (keywordIndex[token.value]) {
                var prevToken = file.getPrevToken(token);
                if (!prevToken) {
                    return;
                }

                prevToken = file.getCommentBeforeToken(token) || prevToken;

                if (prevToken.type !== 'Keyword' && prevToken.value !== ';') {
                    errors.assert.noWhitespaceBetween({
                        token: prevToken,
                        nextToken: token,
                        message: 'Illegal space before "' + token.value + '" keyword'
                    });
                }
            }
        });
    }

};
