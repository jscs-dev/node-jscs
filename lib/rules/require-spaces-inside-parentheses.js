/**
 * Requires space after opening round bracket and before closing.
 *
 * Types: `String` or `Object`
 *
 * Values:
 *  - `String`
 *      - `"all"`: strict mode
 *      - `"allButNested"`: (*deprecated* use Object version with `"except": ["(", ")"]`) ignores nested brackets
 *        in a row
 *  - `Object`:
 *      - `"all"`: true
 *      - `"except"`: Array specifying list of tokens that can occur after an opening bracket or before a
 *        closing bracket without a space
 *
 * #### Example
 *
 * ```js
 * "requireSpacesInsideParentheses": "all"
 * ```
 * ```js
 * "requireSpacesInsideParentheses": {
 *     "all": true,
 *     "except": [ "{", "}" ]
 * }
 * ```
 *
 * ##### Valid for mode `"all"`
 *
 * ```js
 * var x = Math.pow( ( 1 + 2 ), ( 3 + 4 ) );
 * ```
 *
 * ##### Valid for mode `{ "all": true, "except": [ "(", ")" ] }` or `"allButNested"`
 *
 * ```js
 * var x = Math.pow(( 1 + 2 ), ( 3 + 4 ));
 * ```
 *
 * ##### Valid for mode `{ "all": true, "except": [ "{", "}" ] }`
 *
 * ```js
 * var x = Math.pow( foo({ test: 1 }) );
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = Math.pow(1 + 2, 3 + 4);
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        var mode;
        var modes = {
            'all': true,
            'allButNested': true
        };
        var isObject = typeof value === 'object';

        var error = this.getOptionName() + ' rule' +
        ' requires string value \'all\' or \'allButNested\' or object';

        if (typeof value === 'string') {
            assert(modes[value], error);

        } else if (isObject) {
            assert(
                'all' in value || 'allButNested' in value,
                error
            );
        } else {
            assert(false, error);
        }

        this._exceptions = {};

        if (isObject) {
            mode = 'all' in value ? 'all' : 'allButNested';

            (value.except || []).forEach(function(value) {
                this._exceptions[value] = true;
            }, this);

        } else {
            mode = value;
        }

        if (mode === 'allButNested') {
            this._exceptions[')'] = this._exceptions['('] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpacesInsideParentheses';
    },

    check: function(file, errors) {
        var exceptions = this._exceptions;

        file.iterateTokenByValue('(', function(token) {
            var nextToken = file.getNextToken(token, {includeComments: true});
            var value = nextToken.value;

            if (value in exceptions) {
                return;
            }

            // Skip for empty parentheses
            if (value === ')') {
                return;
            }

            errors.assert.whitespaceBetween({
                token: token,
                nextToken: nextToken,
                message: 'Missing space after opening round bracket'
            });
        });

        file.iterateTokenByValue(')', function(token) {
            var prevToken = file.getPrevToken(token, {includeComments: true});
            var value = prevToken.value;

            if (value in exceptions) {

                // Special case - foo( object[i] )
                if (!(
                    value === ']' &&
                    file.getNodeByRange(token.range[0] - 1).type === 'MemberExpression'
                )) {
                    return;
                }
            }

            // Skip for empty parentheses
            if (value === '(') {
                return;
            }

            errors.assert.whitespaceBetween({
                token: prevToken,
                nextToken: token,
                message: 'Missing space before closing round bracket'
            });
        });
    }
};
