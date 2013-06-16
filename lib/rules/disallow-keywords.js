var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallow_keywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallow_keywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;
        var tokens = file.getTokens();
        for (var i = 0, l = tokens.length; i < l; i++) {
            var token = tokens[i];
            if (token.type === 'Keyword' && keywordIndex[token.value]) {
                errors.add(
                    'Illegal keyword: ' + token.value,
                    token.loc.start
                );
            }
        }
    }

};
