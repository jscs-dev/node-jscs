/**
 * Disallows placing keywords on a new line.
 *
 * Type: `Array`
 *
 * Values: Array of quoted keywords
 *
 * #### Example
 *
 * ```js
 * "disallowKeywordsOnNewLine": ["else"]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (x < 0) {
 *     x++;
 * } else {
 *     x--;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (x < 0) {
 *     x++;
 * }
 * else {
 *     x--;
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

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

        file.iterateTokensByType('Keyword', function(token) {
            if (keywordIndex[token.value]) {
                var prevToken = file.getPrevToken(token);

                // Special case for #905, even though it contradicts rule meaning,
                // it makes more sense that way.
                if (token.value === 'else' && prevToken.value !== '}') {
                    return;
                }

                errors.assert.sameLine({
                    token: file.getPrevToken(token),
                    nextToken: token
                });
            }
        });
    }

};
