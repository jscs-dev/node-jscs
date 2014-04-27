var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require keywords on new line
 * @description
 * Requires placing keywords on a new line.
 *
 * Type: `Array`
 *
 * Values: Array of quoted keywords
 *
 * @example <caption>Example:</caption>
 * "requireKeywordsOnNewLine": ["else"]
 * @example <caption>Valid:</caption>
 * if (x < 0) {
 *     x++;
 * }
 * else {
 *     x--;
 * }
 * @example <caption>Invalid:</caption>
 * if (x < 0) {
 *     x++;
 * } else {
 *     x--;
 * }
 */
module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'requireKeywordsOnNewLine option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireKeywordsOnNewLine';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.loc.end.line === token.loc.start.line) {
                    errors.add(
                        'Keyword `' + token.value + '` should be placed on new line',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }

};
