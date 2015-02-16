/**
 * Requires space after keyword.
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of quoted keywords or `true` to require all of the keywords below to have a space afterward.
 *
 * #### Example
 *
 * ```js
 * "requireSpaceAfterKeywords": [
 *     "do",
 *     "for",
 *     "if",
 *     "else",
 *     "switch",
 *     "case",
 *     "try",
 *     "catch",
 *     "void",
 *     "while",
 *     "with",
 *     "return",
 *     "typeof",
 *     "function"
 * ]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * return true;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if(x) {
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
        return 'requireSpaceAfterKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType(['Keyword'], function(token) {
            if (keywordIndex[token.value]) {
                var nextToken = file.getCommentAfterToken(token) || file.getNextToken(token);

                if (nextToken.type === 'Punctuator' && nextToken.value === ';') {
                    return;
                }

                errors.assert.whitespaceBetween({
                    token: token,
                    nextToken: nextToken,
                    spaces: 1,
                    message: 'One space required after "' + token.value + '" keyword'
                });
            }
        });
    }

};
