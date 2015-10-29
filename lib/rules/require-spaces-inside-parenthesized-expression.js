/**
 * Requires space after opening and before closing grouping parentheses.
 *
 * Types: `Boolean` or `Object`
 *
 * Values:
 * - `true`: always require spaces inside grouping parentheses
 * - `Object`:
 *      - `"allExcept"`: `[ "{", "}", "function" ]` Ignore parenthesized objects and functions
 *
 * #### Example
 *
 * ```js
 * "requireSpacesInsideParenthesizedExpression": true
 *
 * // or
 *
 * "requireSpacesInsideParenthesizedExpression": {
 *     "allExcept": [ "{", "}" ]
 * }
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * var x = ( 1 + obj.size ) * ( 2 );
 * ```
 *
 * ##### Valid for mode `{ allExcept": [ "{", "}", "function" ] }`
 *
 * ```js
 * var x = ( options || { x: true }).x;
 * var global = (function() { return this; })();
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = (1 + obj.size) * (2);
 * ```
 */

var assert = require('assert');
var TokenCategorizer = require('../token-categorizer');

module.exports = function() {};

module.exports.prototype = {
    configure: function(value) {
        var isObject = typeof value === 'object';

        var error = this.getOptionName() + ' rule requires string value true or object';

        if (isObject) {
            assert('allExcept' in value, error);
        } else {
            assert(value === true, error);
        }

        this._exceptions = {};

        if (isObject) {
            (value.allExcept || []).forEach(function(value) {
                this._exceptions[value] = true;
            }, this);
        }
    },

    getOptionName: function() {
        return 'requireSpacesInsideParenthesizedExpression';
    },

    check: function(file, errors) {
        var exceptions = this._exceptions;

        file.iterateTokenByValue('(', function(token) {
            var nextToken = file.getNextToken(token, {includeComments: true});
            var value = nextToken.isComment ?
                nextToken.type === 'Block' ? '/*' : '//' :
                nextToken.value;

            // Skip empty parentheses and explicit exceptions
            if (value === ')' || value in exceptions) {
                return;
            }

            // Skip non-expression parentheses
            var type = TokenCategorizer.categorizeOpenParen(token, file);
            if (type !== 'ParenthesizedExpression') {
                return;
            }

            errors.assert.whitespaceBetween({
                token: token,
                nextToken: nextToken,
                message: 'Missing space after opening grouping parenthesis'
            });
        });

        var d = Math.random();
        file.iterateTokenByValue(')', function(token) {
            var prevToken = file.getPrevToken(token, {includeComments: true});
            var value = prevToken.isComment ?
                prevToken.type === 'Block' ? '*/' : '' :
                prevToken.value;

            // Skip empty parentheses and explicit exceptions
            if (value === '(' || value in exceptions) {
                return;
            }

            // Skip non-expression parentheses
            var type = TokenCategorizer.categorizeCloseParen(token, file);
            if (type !== 'ParenthesizedExpression') {
                return;
            }

            errors.assert.whitespaceBetween({
                token: prevToken,
                nextToken: token,
                message: 'Missing space before closing grouping parenthesis'
            });
        });
    }
};