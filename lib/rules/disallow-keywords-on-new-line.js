var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow keywords on new line
 * @description
 * Disallows placing keywords on a new line.
 *
 * Type: `Array`
 *
 * Values: Array of quoted keywords
 *
 * @example <caption>Example:</caption>
 * "disallowKeywordsOnNewLine": ["else"]
 * @example <caption>Valid:</caption>
 * if (x < 0) {
 *     x++;
 * } else {
 *     x--;
 * }
 * @example <caption>Invalid:</caption>
 * if (x < 0) {
 *     x++;
 * }
 * else {
 *     x--;
 * }
 */
module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowKeywordsOnNewLine option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowKeywordsOnNewLine';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.loc.end.line !== token.loc.start.line) {
                    errors.add(
                        'Keyword `' + token.value + '` should not be placed on new line',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }

};
