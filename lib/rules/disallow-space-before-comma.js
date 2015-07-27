/**
 * Disallows spaces before commas
 *
 * Types: `Boolean`
 *
 * Values: `true` to disallow any spaces before any comma
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceBeforeComma": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a,b;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a ,b;
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
        return 'disallowSpaceBeforeComma';
    },

    check: function(file, errors) {
        file.iterateTokensByTypeAndValue('Punctuator', ',', function(token) {
            var prevToken = file.getPrevToken(token);

            errors.assert.noWhitespaceBetween({
                token: prevToken,
                nextToken: token,
                message: 'Illegal space before comma'
            });
        });
    }

};
