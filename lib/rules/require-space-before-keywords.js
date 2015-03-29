/**
 * Requires space before keyword.
 *
 * Types: `Array` or `Boolean`
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
            this.getOptionName() + ' option requires array or true value');

        if (keywords === true) {
            keywords = defaultKeywords;
        }

        this._keywords = keywords;
    },

    getOptionName: function() {
        return 'requireSpaceBeforeKeywords';
    },

    check: function(file, errors) {
        file.iterateTokensByTypeAndValue('Keyword', this._keywords, function(token) {
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
        });
    }

};
