var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow space after keywords
 * @description
 * Disallows space after keyword.
 *
 * Type: `Array`
 *
 * Values: Array of quoted keywords
 *
 * @example <caption>Example:</caption>
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
 * @example <caption>Valid:</caption>
 * if(x > y) {
 *     y++;
 * }
 */
module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowSpaceAfterKeywords option requires array value');
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

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.range[0] !== token.range[1]) {
                    errors.add(
                        'Illegal space after `' + token.value + '` keyword',
                        nextToken.loc.start.line,
                        nextToken.loc.start.column
                    );
                }
            }
        });
    }

};
