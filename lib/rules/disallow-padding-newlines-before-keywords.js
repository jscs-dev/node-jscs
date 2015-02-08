/**
 * Disallow an empty line above the specified keywords.
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of quoted types or `true` to disallow padding new lines after all of the keywords below.
 *
 * #### Example
 *
 * ```js
 * "disallowPaddingNewlinesBeforeKeywords": [
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
 * function(a) {
 *     if (!a) {
 *         return false;
 *     }
 *     for (var i = 0; i < b; i++) {
 *         if (!a[i]) {
 *             return false;
 *         }
 *     }
 *     return true;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function(a) {
 *     if (!a) {
 *
 *         return false;
 *     }
 *
 *     for (var i = 0; i < b; i++) {
 *         if (!a[i]) {
 *
 *             return false;
 *         }
 *     }
 *
 *     return true;
 * }
 * ```
 */

var assert = require('assert');
var defaultKeywords = require('../utils').spacedKeywords;

module.exports = function() { };

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords) || keywords === true,
            'disallowPaddingNewlinesBeforeKeywords option requires array or true value');

        if (keywords === true) {
            keywords = defaultKeywords;
        }

        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowPaddingNewlinesBeforeKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token) {
            if (keywordIndex[token.value]) {
                var prevToken = file.getPrevToken(token);

                if (prevToken && token.loc.start.line - prevToken.loc.end.line > 1) {
                    errors.add(
                        'Keyword `' + token.value + '` should not have an empty line above it',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }
};
