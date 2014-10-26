var assert = require('assert');
var defaultKeywords = require('../utils').spacedKeywords;

module.exports = function() { };

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords) || keywords === true,
            'requirePaddingNewlinesBeforeKeywords option requires array or true value');

        if (keywords === true) {
            keywords = defaultKeywords;
        }

        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requirePaddingNewlinesBeforeKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var prevToken = tokens[i - 1];

                // Handle special case of 'else if' construct.
                if (token.value === 'if' && prevToken && prevToken.value === 'else') {
                    return;
                }

                // Handle all other cases
                // The { character is there to handle the case of a matching token which happens to be the first
                //   statement in a block
                // The ) character is there to handle the case of `if (...) matchingKeyword` in which case
                //   requiring padding would break the statement
                if (prevToken && prevToken.value !== '{' && prevToken.value !== ')' &&
                    token.loc.start.line - prevToken.loc.end.line < 2) {
                    errors.add(
                        'Keyword `' + token.value + '` should have an empty line above it',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }
};
