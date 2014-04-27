var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require space after keywords
 * @description
 * Requires space after keyword.
 *
 * Type: `Array`
 *
 * Values: Array of quoted keywords
 *
 * @example <caption>Example:</caption>
 * "requireSpaceAfterKeywords": [
 *     "if",
 *     "else",
 *     "for",
 *     "while",
 *     "do",
 *     "switch",
 *     "return",
 *     "try",
 *     "catch"
 * ]
 * @example <caption>Valid:</caption>
 * return true;
 * @example <caption>Invalid:</caption>
 * if(x) {
 *     x++;
 * }
 */
module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'requireSpaceAfterKeywords option requires array value');
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

        file.iterateTokensByType([ 'Keyword' ], function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var nextToken = tokens[i + 1];

                if (nextToken && nextToken.range[0] - token.range[1] !== 1) {
                    if (nextToken.type !== 'Punctuator' || nextToken.value !== ';') {
                        errors.add(
                            'Missing space after `' + token.value + '` keyword',
                            nextToken.loc.start.line,
                            nextToken.loc.start.column
                        );
                    }
                }
            }
        });
    }

};
