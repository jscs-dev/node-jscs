var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowNewlinesBeforeCurlyBraces option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowNewlinesBeforeCurlyBraces';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function (token, i, tokens) {
            if ('{' !== token.value) return;
            var prevToken = tokens[i - 1];
            if (prevToken && operators[prevToken.value] && prevToken.loc.end.line !== token.loc.start.line) {
                errors.add(
                    'Curly brace should not be placed on new line',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};
