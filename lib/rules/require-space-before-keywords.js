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

        file.iterateTokensByType(['Keyword'], function(token) {
            if (keywordIndex[token.value]) {
                var prevToken = file.getPrevToken(token, {includeComments: true});
                if (!prevToken || prevToken.isComment) {
                    return;
                }

                if (prevToken.type !== 'Punctuator' || prevToken.value !== ';') {
                    errors.assert.whitespaceBetween({
                        token: prevToken,
                        nextToken: token,
                        message: 'Missing space before "' + token.value + '" keyword'
                    });
                }
            }
        });
    }

};
