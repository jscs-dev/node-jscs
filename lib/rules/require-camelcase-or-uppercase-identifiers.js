/**
 * Requires identifiers to be camelCased or UPPERCASE_WITH_UNDERSCORES
 *
 * Type: `Boolean` or `String`
 *
 * Values: `true` or `"ignoreProperties"`
 *
 * JSHint: [`camelcase`](http://jshint.com/docs/options/#camelcase)
 *
 * #### Example
 *
 * ```js
 * "requireCamelCaseOrUpperCaseIdentifiers": true
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * var camelCase = 0;
 * var CamelCase = 1;
 * var _camelCase = 2;
 * var camelCase_ = 3;
 * var UPPER_CASE = 4;
 * ```
 *
 * ##### Invalid for mode `true`
 *
 * ```js
 * var lower_case = 1;
 * var Mixed_case = 2;
 * var mixed_Case = 3;
 * ```
 *
 * ##### Valid for mode `ignoreProperties`
 *
 * ```js
 * var camelCase = 0;
 * var CamelCase = 1;
 * var _camelCase = 2;
 * var camelCase_ = 3;
 * var UPPER_CASE = 4;
 * var obj.snake_case = 5;
 * var camelCase = { snake_case: 6 };
 * ```
 *
 * ##### Invalid for mode `ignoreProperties`
 *
 * ```js
 * var lower_case = 1;
 * var Mixed_case = 2;
 * var mixed_Case = 3;
 * var snake_case = { snake_case: 6 };
 * ```
 */

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
        file.iterateTokensByType('Identifier', function(token) {
            var value = token.value;
            if (value.replace(/^_+|_+$/g, '').indexOf('_') === -1 || value.toUpperCase() === value) {
                return;
            }
            if (this._ignoreProperties) {
                var nextToken = file.getNextToken(token);
                var prevToken = file.getPrevToken(token);

                if (nextToken && nextToken.value === ':') {
                    return;
                }

                if (prevToken && prevToken.value === '.') {
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
