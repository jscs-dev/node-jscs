/**
 * Disallows multiple blank lines in a row.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowMultipleLineBreaks": true
 * ```
 *
 * ##### Valid
 * ```js
 * var x = 1;
 *
 * x++;
 * ```
 *
 * ##### Invalid
 * ```js
 * var x = 1;
 *
 *
 * x++;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowMultipleLineBreaks';
    },

    check: function(file, errors) {
        // Iterate over all tokens (including comments)
        file.iterateTokensByType('Whitespace', function(whitespaceToken) {
            if (whitespaceToken.getNewlineCount() === 0) {
                return;
            }

            var token = whitespaceToken.getPreviousNonWhitespaceToken();

            if (!token) {
                return;
            }

            var nextToken = token.getNextNonWhitespaceToken();

            errors.assert.linesBetween({
                token: token,
                nextToken: nextToken,
                atMost: 2
            });
        });
    }

};
