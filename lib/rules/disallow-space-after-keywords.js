/**
 * Disallows space after keyword.
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of quoted keywords or `true` to disallow spaces after all possible keywords.
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceAfterKeywords": [
 *     "if",
 *     "else",
 *     "for",
 *     "while",
 *     "do",
 *     "switch",
 *     "try",
 *     "catch"
 * ]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if(x > y) {
 *     y++;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (x > y) {
 *     y++;
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
            'disallowSpaceAfterKeywords option requires array or true value'
        );

        if (keywords === true) {
            keywords = defaultKeywords;
        }

        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpaceAfterKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token) {
            if (keywordIndex[token.value]) {
                errors.assert.noWhitespaceBetween({
                    token: token,
                    nextToken: file.getNextToken(token)
                });
            }
        });
    }

};
