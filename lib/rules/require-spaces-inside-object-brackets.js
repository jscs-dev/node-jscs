/**
 * Requires space after opening object curly brace and before closing.
 *
 * Types: `Object` or `String`
 *
 * Values: `"all"` for strict mode, `"allButNested"` (*deprecated* use `"allExcept": ['}']`)
 * ignores closing brackets in a row.
 *
 * #### Example
 *
 * ```js
 * "requireSpacesInsideObjectBrackets": {
 *     "allExcept": [ "}", ")" ]
 * }
 *
 * // or
 * "requireSpacesInsideObjectBrackets": true | "all" | "allButNested"
 * ```
 *
 * ##### Valid for mode `"all"`
 *
 * ```js
 * var x = { a: { b: 1 } };
 * ```
 *
 * ##### Valid for mode `"allButNested"`
 *
 * ```js
 * var x = { a: { b: 1 }};
 * ```
 *
 * ##### Valid for mode `"allExcept": [ "}", ")" ]`
 *
 * ```js
 * var x = { a: (b ? 1 : 2)};
 * var x = { a: { b: 1 }};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = {a: 1};
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

        if (mode === 'allButNested') {
            this._exceptions['}'] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpacesInsideObjectBrackets';
    },

    check: function(file, errors) {
        var exceptions = this._exceptions;

        file.iterateNodesByType(['ObjectExpression', 'ObjectPattern'], function(node) {
            var openingBracket = file.getFirstNodeToken(node);
            var nextToken = file.getNextToken(openingBracket);

            // Don't check empty object
            if (nextToken.value === '}') {
                return;
            }

            errors.assert.spacesBetween({
                token: openingBracket,
                nextToken: nextToken,
                exactly: 1,
                message: 'One space required after opening curly brace'
            });

            var closingBracket = file.getLastNodeToken(node);
            var prevToken = file.getPrevToken(closingBracket);

            if (prevToken.value in exceptions) {
                return;
            }

            errors.assert.spacesBetween({
                token: prevToken,
                nextToken: closingBracket,
                exactly: 1,
                message: 'One space required before closing curly brace'
            });
        });
    }
};
