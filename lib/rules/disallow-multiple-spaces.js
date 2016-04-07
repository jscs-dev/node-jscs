/**
 * Disallows multiple indentation characters (tabs or spaces) between identifiers, keywords, and any other token
 *
 * Type: `Boolean` or `Object`
 *
 * Values: `true` or `{"allowEOLComments": true}` to allow on-line comments to be ignored
 *
 * #### Examples
 *
 * ```js
 * "disallowMultipleSpaces": true
 * // or
 * "disallowMultipleSpaces": {"allowEOLComments": true}
 * ```
 *
 * ##### Valid
 * ```js
 * var x = "hello";
 * function y() {}
 * ```
 *
 * ##### Valid for `{"allowEOLComments": true}`
 *
 * ```js
 * var x = "hello"    // world;
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

        this._allowEOLComments = options.allowEOLComments;
    },

    getOptionName: function() {
        return 'disallowMultipleSpaces';
    },

    check: function(file, errors) {
        var token = file.getProgram().getFirstToken();
        var nextToken;

        while (token) {
            nextToken = token.getNextNonWhitespaceToken();

            if (!nextToken) {
                break;
            }

            if (!this._allowEOLComments || nextToken.type !== 'CommentLine') {
                errors.assert.spacesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 1
                });
            }

            token = token.getNextNonWhitespaceToken();
        }
    }

};
