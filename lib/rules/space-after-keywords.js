var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var value, keyword;

        assert(
            typeof options === 'object',
            'spaceAfterKeywords option must be an object'
        );

        this._keywordIndex = {};

        for (keyword in options) {
            if (options.hasOwnProperty(keyword)) {
                value = options[keyword];
                assert(typeof value === 'boolean', 'spaceAfterKeywords values must be boolean values');
                this._keywordIndex[keyword] = value;
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
            var value = typeof keywordIndex[token.value] === 'undefined' ? null : keywordIndex[token.value];
            if (value === true) {
                if (nextToken && nextToken.range[0] === token.range[1]) {
                    if (nextToken.type !== 'Punctuator' || nextToken.value !== ';') {
                        errors.add(
                            'Missing space after `' + token.value + '` keyword',
                            nextToken.loc.start.line,
                            nextToken.loc.start.column
                        );
                    }
                }
            } else if (value === false) {
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
