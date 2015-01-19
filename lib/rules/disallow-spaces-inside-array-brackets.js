/**
 * Disallows space after opening array square bracket and before closing.
 *
 * Type: `Boolean` or `String`
 *
 * Values: `"all"` or `true` for strict mode, `"nested"` (*deprecated* use `"allExcept": [ "[", "]" ]`)
 * ignores closing brackets in a row.
 *
 * #### Example
 *
 * ```js
 * "disallowSpacesInsideArrayBrackets": "all"
 *
 * // or
 *
 * "requireSpacesInsideArrayBrackets": {
 *     "allExcept": [ "[", "]", "{", "}" ]
 * }
 * ```
 *
 * ##### Valid for mode `"all"`
 *
 * ```js
 * var x = [[1]];
 * ```
 *
 *
 * ##### Valid for mode `"nested"`
 *
 * ```js
 * var x = [ [1] ];
 * ```
 *
 * ##### Valid for mode `"allExcept"`
 *
 * ```js
 * var x = [ [1] ];
 * var x = [ { a: 1 } ];
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = [ [ 1 ] ];
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        var mode;
        var modes = {
            'all': true,
            'nested': true
        };
        var isObject = typeof value === 'object';

        var error = 'disallowSpacesInsideArrayBrackets rule' +
        ' requires string value "all" or "nested" or object';

        if (typeof value === 'string' || value === true) {
            assert(modes[value === true ? 'all' : value], error);

        } else if (isObject) {
            assert('allExcept' in value, error);
        } else {
            assert(false, error);
        }

        this._exceptions = {};

        if (isObject) {
            (value.allExcept || []).forEach(function(value) {
                this._exceptions[value] = true;
            }, this);

        } else {
            mode = value;
        }

        if (mode === 'nested') {
            this._exceptions['['] = this._exceptions[']'] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpacesInsideArrayBrackets';
    },

    check: function(file, errors) {
        var exceptions = this._exceptions;

        file.iterateTokenByValue('[', function(token, index, tokens) {
            var nextToken = file.getNextToken(token);
            var value = nextToken.value;

            if (value in exceptions) {
                return;
            }

            // Skip for empty array brackets
            if (value === ']') {
                return;
            }

            errors.assert.noWhitespaceBetween({
                token: token,
                nextToken: nextToken,
                spaces: 1,
                message: 'Illegal space after opening bracket'
            });
        });

        file.iterateTokenByValue(']', function(token, index, tokens) {
            var prevToken = file.getPrevToken(token);
            var value = prevToken.value;

            if (value in exceptions) {
                return;
            }

            // Skip for empty array brackets
            if (value === '[') {
                return;
            }

            errors.assert.noWhitespaceBetween({
                token: prevToken,
                nextToken: token,
                spaces: 1,
                message: 'Illegal space before closing bracket'
            });
        });
    }
};
