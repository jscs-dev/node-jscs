var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireCamelCase) {
        assert(
            requireCamelCase === true || requireCamelCase === 'ignoreProperties',
            'requireCamelCaseOrUpperCaseIdentifiers option requires true value or `ignoreProperties` string'
        );

        this._ignoreProperties = (requireCamelCase === 'ignoreProperties');
    },

    getOptionName: function() {
        return 'requireCamelCaseOrUpperCaseIdentifiers';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Identifier', function(token, index, tokens) {
            var value = token.value;
            if (value.replace(/^_+|_+$/g, '').indexOf('_') === -1 || value.toUpperCase() === value) {
                return;
            }
            if (this._ignoreProperties) {
                if (index + 1 < tokens.length && tokens[index + 1].value === ':') {
                    return;
                }
                if (index > 0 && tokens[index - 1].value === '.') {
                    return;
                }
            }
            errors.add(
                'All identifiers must be camelCase or UPPER_CASE',
                token.loc.start.line,
                token.loc.start.column
            );
        }.bind(this));
    }

};
