/**
 * Requires identifiers to be camelCased or UPPERCASE_WITH_UNDERSCORES
 *
 * Types: `Boolean` or `String` or `Object`
 *
 * Values:
 *
 * - `true`
 * - `"ignoreProperties"` allows an exception for object property names. Deprecated, Please use the `Object` value
 * - `Object`:
 *    - `ignoreProperties`:  boolean that allows an exception for object property names
 *    - `strict`: boolean that forces the first character to not be capitalized
 *
 * JSHint: [`camelcase`](http://jshint.com/docs/options/#camelcase)
 *
 * #### Example
 *
 * ```js
 * "requireCamelCaseOrUpperCaseIdentifiers": true
 *
 * "requireCamelCaseOrUpperCaseIdentifiers": {"ignoreProperties": true, "strict": true}
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
 *
 * ##### Valid for mode `strict`
 *
 * ```js
 * var camelCase = 0;
 * var _camelCase = 2;
 * var camelCase_ = 3;
 * var UPPER_CASE = 4;
 * var obj.snake_case = 5;
 * var camelCase = { snake_case: 6 };
 * ```
 *
 * ##### Invalid for mode `strict`
 *
 * ```js
 * var Mixed_case = 2;
 * var Snake_case = { snake_case: 6 };
 * var snake_case = { SnakeCase: 6 };
 * ```
 *
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        if (typeof options !== 'object') {
            assert(
              options === true || options === 'ignoreProperties',
              this.getOptionName() + ' option requires a true value or `ignoreProperties`'
            );
            var _options = {
                ignoreProperties: options === 'ignoreProperties' ? true : false,
                strict: false
            };
            return this.configure(_options);
        }

        assert(
          typeof options.ignoreProperties === 'boolean' || typeof options.strict === 'boolean',
          this.getOptionName() + ' option should have boolean values for ignoreProperties and/or strict'
        );
        this._ignoreProperties = options.ignoreProperties;
        this._strict = options.strict;
    },

    getOptionName: function() {
        return 'requireCamelCaseOrUpperCaseIdentifiers';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Identifier', function(token) {
            var value = token.value;
            if (value.replace(/^_+|_+$/g, '').indexOf('_') === -1 || value.toUpperCase() === value) {
                if (!this._strict) {return;}
                if (value[0].toUpperCase() !== value[0] || value[0] === '_') {
                    return;
                }
            }
            if (this._ignoreProperties) {
                var nextToken = file.getNextToken(token);
                var prevToken = file.getPrevToken(token);

                if (nextToken && nextToken.value === ':') {
                    return;
                }

                /* This enables an identifier to be snake cased via the object
                 * destructuring pattern. We must check to see if the identifier
                 * is being used to set values into an object to determine if
                 * this is a legal assignment.
                 * Example: ({camelCase: snake_case}) => camelCase.length
                 */
                if (prevToken && prevToken.value === ':') {
                    var node = file.getNodeByRange(token.range[0]);
                    var parentNode = node.parentNode;
                    if (parentNode && parentNode.type === 'Property') {
                        var grandpa = parentNode.parentNode;
                        if (grandpa && grandpa.type === 'ObjectPattern') {
                            return;
                        }
                    }
                }

                if (prevToken && (prevToken.value === '.' ||
                    prevToken.value === 'get' || prevToken.value === 'set')) {
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
