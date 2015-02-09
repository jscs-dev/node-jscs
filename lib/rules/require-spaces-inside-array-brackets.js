/**
 * Requires space after opening array square bracket and before closing.
 *
 * Type: `String` or `Object`
 *
 * Values: `"all"` for strict mode, `"allButNested"` (*deprecated* use `"allExcept": [ "[", "]"]`)
 * ignores closing brackets in a row.
 *
 * #### Example
 *
 * ```js
 * "requireSpacesInsideArrayBrackets": "all"
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
 * var x = [ 1 ];
 * ```
 *
 * ##### Valid for mode `"allButNested"`
 *
 * ```js
 * var x = [[ 1 ], [ 2 ]];
 * ```
 *
 * ##### Valid for mode `"allExcept"`
 *
 * ```js
 * var x = [[ 1 ], [ 2 ]];
 * var x = [{ a: 1 }, { b: 2}];
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = [1];
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

        var error = 'requireSpacesInsideArrayBrackets rule' +
        ' requires string value "all" or "allButNested" or object';

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
            this._exceptions['['] = this._exceptions[']'] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpacesInsideArrayBrackets';
    },

    check: function(file, errors) {
        var exceptions = this._exceptions;

        file.iterateNodesByType('ArrayExpression', function(node) {
            var openBracket = file.getFirstNodeToken(node);
            var afterOpen = file.getNextToken(openBracket);
            var closeBracket = file.getLastNodeToken(node);
            var beforeClose = file.getPrevToken(closeBracket);

            // Skip for empty array brackets
            if (afterOpen.value === ']') {
                return;
            }

            if (!(afterOpen.value in exceptions)) {
                errors.assert.whitespaceBetween({
                    token: openBracket,
                    nextToken: afterOpen,
                    spaces: 1,
                    message: 'One space required after opening bracket'
                });
            }

            if (!(beforeClose.value in exceptions)) {
                errors.assert.whitespaceBetween({
                    token: beforeClose,
                    nextToken: closeBracket,
                    spaces: 1,
                    message: 'One space required before closing bracket'
                });
            }
        });
    }
};
