/**
 * Disallows spaces after commas
 *
 * Types: `Boolean`
 *
 * Values: `true` to disallow any spaces after any comma
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceAfterComma": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * [a,b,c];
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * [a, b, c];
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
        return 'disallowSpaceAfterComma';
    },

    check: function(file, errors) {
        file.iterateTokensByTypeAndValue('Punctuator', ',', function(token) {
            var nextToken = file.getNextToken(token);

            if (nextToken.value === ',') {
                return;
            }
            errors.assert.noWhitespaceBetween({
                token: token,
                nextToken: nextToken,
                message: 'Illegal space after comma'
            });
        });
    }

};
