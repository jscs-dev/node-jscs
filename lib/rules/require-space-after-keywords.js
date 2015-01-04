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
var util = require('util');
var texts = [
    'Missing space after "%s" keyword',
    'Should be one space instead of %d, after "%s" keyword'
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
        return 'requireSpaceAfterKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType(['Keyword'], function(token) {
            if (keywordIndex[token.value]) {
                var nextToken = file.getCommentAfterToken(token) || file.getNextToken(token);
                var diff = nextToken.range[0] - token.range[1];

                if (nextToken.loc.end.line === token.loc.start.line &&
                    diff !== 1
                ) {
                    if (nextToken.type !== 'Punctuator' || nextToken.value !== ';') {
                        errors.add(
                            util.format.apply(null,
                                diff === 0 ?
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
