/**
 * Disallows multiple indentation characters (tabs or spaces) between identifiers, keywords, and any other token
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowMultipleSpaces": true
 * ```
 *
 * ##### Valid
 * ```js
 * var x = "hello";
 * function y() {}
 * ```
 *
 * ##### Invalid
 * ```js
 * var x  = "hello";
 * function  y() {}
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true ||
            typeof options === 'object' &&
            options.allowEOLComments === true,
            this.getOptionName() + ' option requires true value ' +
            'or an object with `allowEOLComments` property'
        );

        this.allowEOLComments = options.allowEOLComments;
    },

    getOptionName: function() {
        return 'disallowMultipleSpaces';
    },

    check: function(file, errors) {
        // Iterate over all tokens (including comments)
        var _this = this;
        file.getTokens().forEach(function(token, index, tokens) {
            // If there are no trailing tokens, exit early
            var nextToken = tokens[index + 1];
            if (!nextToken) {
                return;
            }

            // If we are allowing EOL comments and the next token is an EOL comment skip it
            // We don't need to check the current token since EOL comments must be on separate lines from the next one
            if (_this.allowEOLComments && nextToken.type === 'Line') {
                return;
            }

            // Verify we have at most 1 space between this token and the next (won't fail for different lines)
            errors.assert.spacesBetween({
                token: token,
                nextToken: nextToken,
                atMost: 1,
            });
        });
    }

};
