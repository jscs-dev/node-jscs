/**
 * Disallows keywords in your comments, such as TODO or FIXME
 *
 * Types: `Boolean`, `String` or `Array`
 *
 * Values:
 * - `true`
 * - `'\b(word1|word2)\b'`
 * - `['word1', 'word2']`
 *
 * #### Examples
 *
 * ```js
 * "disallowKeywordsInComments": true
 * "disallowKeywordsInComments": "\\b(word1|word2)\\b"
 * "disallowKeywordsInComments": ["word1", "word2"]
 * ```
 *
 * #### Invalid:
 * ```
 * // ToDo
 * //TODO
 * /** fixme *\/
 * /**
 *  * FIXME
 *  *\/
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(keywords) {
        this._message = 'Comments cannot contain the following keywords: ';
        this._keywords = ['todo', 'fixme'];

        switch (true) {
            case Array.isArray(keywords):
                // use the array of strings provided to build RegExp pattern
                this._keywords = keywords;
                /* falls through */
            case keywords:
                // use default keywords
                this._message += this._keywords.join(', ');
                this._keywordRegEx = new RegExp('\\b(' + this._keywords.join('|') + ')\\b', 'gi');
                break;
            case typeof keywords === 'string':
                // use string passed in as the RegExp pattern
                this._message = 'Comments cannot contain keywords based on the expression you provided';
                this._keywordRegEx = new RegExp(keywords, 'gi');
                break;
            default:
                assert(false, this.getOptionName() + ' option requires a true value, a string or an array');
        }
    },

    getOptionName: function() {
        return 'disallowKeywordsInComments';
    },

    check: function(file, errors) {
        var keywordRegEx = this._keywordRegEx;
        file.iterateTokensByType(['CommentLine', 'CommentBlock'], function(comment) {
            var match;

            // Both '//' and '/*' comment starters have offset '2'
            var commentOffset = 2;
            keywordRegEx.lastIndex = 0;
            while ((match = keywordRegEx.exec(comment.value)) !== null) {
                errors.add(
                    this.mesage,
                    comment,
                    match.index + commentOffset
                );
            }
        });
    }
};
