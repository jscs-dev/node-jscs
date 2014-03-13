var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow keywords
 * @description
 * Disallows usage of specified keywords.
 *
 * Type: `Array`
 *
 * Values: Array of quoted keywords
 *
 * @example <caption>Example:</caption>
 * "disallowKeywords": ["with"]
 * @example <caption>Invalid:</caption>
 * with (x) {
 *     prop++;
 * }
 */
module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token) {
            if (keywordIndex[token.value]) {
                errors.add(
                    'Illegal keyword: ' + token.value,
                    token.loc.start
                );
            }
        });
    }

};
