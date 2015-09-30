/**
 * Requires space after comma
 *
 * Types: `Boolean`
 *
 * Values: `true` to require a space after any comma
 *
 * #### Example
 *
 * ```js
 * "requireSpaceAfterComma": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a, b;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a,b;
 * ```
 */

var assert = require('assert');

module.exports = function() {
};

module.exports.prototype = {

    configure: function(option) {
        assert(
            option === true,
            this.getOptionName() + ' option requires true value'
        );
    },

    getOptionName: function() {
        return 'requireSpaceAfterComma';
    },

    check: function(file, errors) {
        file.iterateTokensByTypeAndValue('Punctuator', ',', function(token) {
            errors.assert.whitespaceBetween({
                token: token,
                nextToken: file.getNextToken(token),
                message: 'Space required after comma'
            });
        });
    }

};
