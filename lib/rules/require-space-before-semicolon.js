/**
 * Requires space before semicolon.
 *
 * Types: `Boolean`
 *
 * Values: `true` to require a single space before any semicolon.
 *
 * #### Example
 *
 * ```js
 * "requireSpaceBeforeSemicolon": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = 1 ;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 1;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSpaceBeforeSemicolon) {
        assert(
          typeof requireSpaceBeforeSemicolon === 'boolean',
          this.getOptionName() + ' option requires true value'
        );
    },

    getOptionName: function() {
        return 'requireSpaceBeforeSemicolon';
    },

    check: function(file, errors) {
        file.iterateTokensByTypeAndValue('Punctuator', ';', function(token) {
            var prevToken = file.getPrevToken(token, {includeComments: true});
            if (!prevToken || prevToken.isComment) {
                return;
            }

            errors.assert.spaceBetween({
                token: prevToken,
                nextToken: token,
                exactly: 1,
                message: 'Missing space before semicolon'
            });
        });
    }

};
