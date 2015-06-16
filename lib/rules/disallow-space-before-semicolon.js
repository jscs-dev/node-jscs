/**
 * Disallows spaces before semicolons.
 *
 * Types: `Boolean`
 *
 * Values: `true` to disallow any spaces before any semicolon.
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceBeforeSemicolon": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = 1;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 1 ;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSpaceBeforeSemicolon) {
        assert(
          typeof disallowSpaceBeforeSemicolon === 'boolean',
          this.getOptionName() + ' option requires true value'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeSemicolon';
    },

    check: function(file, errors) {
        file.iterateTokensByTypeAndValue('Punctuator', ';', function(token) {
            var prevToken = file.getPrevToken(token, {includeComments: true});
            if (!prevToken || prevToken.isComment) {
                return;
            }

            if (prevToken.value !== ';') {
                errors.assert.noWhitespaceBetween({
                    token: prevToken,
                    nextToken: token,
                    message: 'Illegal space before semicolon'
                });
            }
        });
    }

};
