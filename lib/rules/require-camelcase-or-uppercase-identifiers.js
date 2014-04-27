var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require camel-case or upper-case identifiers
 * @description
 * Requires identifiers to be camelCased or UPPERCASE_WITH_UNDERSCORES
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [camelcase](http://jshint.com/docs/options/#camelcase)
 *
 * @example <caption>Example:</caption>
 * "requireCamelCaseOrUpperCaseIdentifiers": true
 * @example <caption>Valid:</caption>
 * var camelCase = 0;
 * var CamelCase = 1;
 * var _camelCase = 2;
 * var camelCase_ = 3;
 * var UPPER_CASE = 4;
 * @example <caption>Invalid:</caption>
 * var lower_case = 1;
 * var Mixed_case = 2;
 * var mixed_Case = 3;
 */
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
        file.iterateTokensByType('Identifier', function(token) {
            var value = token.value;
            if (value.replace(/^_+|_+$/g, '').indexOf('_') > -1 && value.toUpperCase() !== value) {
                errors.add(
                    'All identifiers must be camelCase or UPPER_CASE',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};
