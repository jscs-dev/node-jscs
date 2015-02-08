/**
 * Requires an empty line above the specified keywords unless the keyword is the first expression in a block.
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of quoted types or `true` to require padding new lines before all of the keywords below.
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewlinesBeforeKeywords": [
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
 *
 *     for (var i = 0; i < b; i++) {
 *         if (!a[i]) {
 *             return false;
 *         }
 *     }
 *
 *     return true;
 * }
 * ```
 *
 * ##### Invalid
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
 */

var assert = require('assert');
var defaultKeywords = require('../utils').spacedKeywords;

module.exports = function() { };

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords) || keywords === true,
            'requirePaddingNewlinesBeforeKeywords option requires array or true value');

        if (keywords === true) {
            keywords = defaultKeywords;
        }

        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requirePaddingNewlinesBeforeKeywords';
    },

    check: function(file, errors) {
        var excludedTokens = [':', ',', '(', '='];
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token) {
            if (keywordIndex[token.value]) {
                var prevToken = file.getPrevToken(token);

                // Handle special case of 'else if' construct.
                if (token.value === 'if' && prevToken && prevToken.value === 'else') {
                    return;
                // Handling for special cases.
                } else if (prevToken && excludedTokens.indexOf(prevToken.value) > -1) {
                    return;
                }

                // Handle all other cases
                // The { character is there to handle the case of a matching token which happens to be the first
                //   statement in a block
                // The ) character is there to handle the case of `if (...) matchingKeyword` in which case
                //   requiring padding would break the statement
                if (prevToken && prevToken.value !== '{' && prevToken.value !== ')' &&
                    token.loc.start.line - prevToken.loc.end.line < 2) {
                    errors.add(
                        'Keyword `' + token.value + '` should have an empty line above it',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }
};
