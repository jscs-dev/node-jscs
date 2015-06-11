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
        assert(Array.isArray(keywords), this.getOptionName() + ' option requires array value');
        this._keywords = keywords;
    },

    getOptionName: function() {
        return 'disallowKeywordsOnNewLine';
    },

    check: function(file, errors) {
        file.iterateTokensByTypeAndValue('Keyword', this._keywords, function(token) {
            var prevToken = file.getPrevToken(token);

            // Special case for #905, even though it contradicts rule meaning,
            // it makes more sense that way.
            if (token.value === 'else' && prevToken.value !== '}') {
                return;
            }

            // Special cases for #885, using while as the keyword contradicts rule meaning
            // but it is more efficient and reduces complexity of the code in this rule
            if (token.value === 'while') {
                var nodes = file.getNodesByFirstToken(token);

                if (nodes.length === 0) {
                    // "while" that is part of a do will not return nodes as it is not a start token
                    if (prevToken.value !== '}') {
                        // allow "while" that is part of a "do while" with no braces to succeed
                        return;
                    }
                } else {
                    // it is a "while" statement that is not part of a "do while"
                    // , allow it to succeed even though it contradicts rule meaning
                    return;
                }
            }

            errors.assert.sameLine({
                token: prevToken,
                nextToken: token
            });
        });
    }

};
