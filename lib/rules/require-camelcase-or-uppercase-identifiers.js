var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireCamelCaseOrUpperCaseIdentifiers) {
        assert(
            typeof requireCamelCaseOrUpperCaseIdentifiers === 'boolean',
            'requireCamelCaseOrUpperCaseIdentifiers option requires boolean value'
        );
        assert(
            requireCamelCaseOrUpperCaseIdentifiers === true,
            'requireCamelCaseOrUpperCaseIdentifiers option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireCamelCaseOrUpperCaseIdentifiers';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Identifier', function(token, index, tokens) {
            var value = token.value;
            if (value.replace(/^_+|_+$/g, '').indexOf('_') > -1 &&
                value.toUpperCase() !== value &&
                (tokens.length === index + 1 || tokens[index + 1].value !== ':')) {
                errors.add(
                    'All identifiers must be camelCase or UPPER_CASE',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};
