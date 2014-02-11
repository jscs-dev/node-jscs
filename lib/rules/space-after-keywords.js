var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var i, l;

        assert(
            typeof options === 'object',
            'spaceAfterKeywords option must be an object'
        );

        this._keywordIndex = {};

        if ('required' in options) {
            var requried = options.required;
            assert(Array.isArray(requried), 'spaceAfterKeywords.required option requires array value');
            for (i = 0, l = requried.length; i < l; i++) {
                this._keywordIndex[requried[i]] = true;
            }
        }
        if ('disallowed' in options) {
            var disallowed = options.disallowed;
            assert(Array.isArray(disallowed), 'spaceAfterKeywords.allowed option requires array value');
            for (i = 0, l = disallowed.length; i < l; i++) {
                this._keywordIndex[disallowed[i]] = false;
            }
        }

    },

    getOptionName: function () {
        return 'spaceAfterKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            var nextToken = tokens[i + 1];
            var keyword = typeof keywordIndex[token.value] === 'undefined' ? null : keywordIndex[token.value];
            if (keyword === true) {
                if (nextToken && nextToken.range[0] === token.range[1]) {
                    if (nextToken.type !== 'Punctuator' || nextToken.value !== ';') {
                        errors.add(
                            'Missing space after `' + token.value + '` keyword',
                            nextToken.loc.start.line,
                            nextToken.loc.start.column
                        );
                    }
                }
            } else if (keyword === false) {
                if (nextToken && nextToken.range[0] !== token.range[1]) {
                    errors.add(
                        'Illegal space after `' + token.value + '` keyword',
                        nextToken.loc.start.line,
                        nextToken.loc.start.column
                    );
                }
            }
        });
    }

};
