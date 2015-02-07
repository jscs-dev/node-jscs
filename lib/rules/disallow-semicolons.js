/**
 * Disallows lines from ending in a semicolon.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowSemicolons": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = 1
 * ;[b].forEach(c)
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 1;
 * [b].forEach(c);
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowSemicolons) {
        assert(
            disallowSemicolons === true,
            'disallowSemicolons option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSemicolons';
    },

    check: function(file, errors) {
        file.iterateTokensByTypeAndValue('Punctuator', ';', function(token) {
            errors.assert.sameLine({
                token: token,
                nextToken: file.getNextToken(token),
                requireNextToken: true,
                message: 'Semicolons are disallowed at the end of a line.'
            });
        });
    }
};
