/**
 * Requires space after comma
 *
 * Types: `Boolean`, or `String`
 *
 * Values:
 *  - `Boolean`: `true` to require a space after any comma
 *  - `String`: `"exceptTrailingCommas"` to require a space after all but trailing commas
 *
 * #### Example
 *
 * ```js
 * "requireSpaceAfterComma": true
 * ```
 * ```
 * "requireSpaceAfterComma": "exceptTrailingCommas"
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * var a, b;
 * ```
 *
 * ##### Invalid for mode `true`
 *
 * ```js
 * var a,b;
 * ```
 *
 *##### Valid for mode `"exceptTrailingCommas"`
 *
 * ```js
 * var a = [1, 2,];
 * ```
 *
 * ##### Invalid for mode `"exceptTrailingCommas"`
 *
 * ```js
 * var a = [a,b,];
 * ```
 *
 */

var assert = require('assert');

module.exports = function() {
};

module.exports.prototype = {

    configure: function(option) {
        assert(
            option === true || option === 'exceptTrailingCommas',
            this.getOptionName() + ' option requires true value or "exceptTrailingCommas"'
        );
        this._exceptTrailingCommas = option === 'exceptTrailingCommas';
    },

    getOptionName: function() {
        return 'requireSpaceAfterComma';
    },

    check: function(file, errors) {
        var exceptTrailingCommas = this._exceptTrailingCommas;
        file.iterateTokensByTypeAndValue('Punctuator', ',', function(token) {
            if (exceptTrailingCommas && [']', '}'].indexOf(file.getNextToken(token).value) >= 0) {
                return;
            }
            errors.assert.whitespaceBetween({
                token: token,
                nextToken: file.getNextToken(token),
                message: 'Space required after comma'
            });
        });
    }

};
