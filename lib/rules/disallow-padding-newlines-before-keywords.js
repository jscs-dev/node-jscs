var assert = require('assert');

module.exports = function() { };

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowPaddingNewlinesBeforeKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowPaddingNewlinesBeforeKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var prevToken = tokens[i - 1];

                if (prevToken && token.loc.start.line - prevToken.loc.end.line > 1) {
                    errors.add(
                        'Keyword `' + token.value + '` should not have an empty line above it',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }
};
