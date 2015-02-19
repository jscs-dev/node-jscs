/**
 * Requires newline before line comments
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewLinesBeforeLineComments": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = 2;
 *
 * // comment
 * return a;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 2;
 * //comment
 * return a;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        assert(
            value === true,
            'requirePaddingNewLinesBeforeLineComments option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requirePaddingNewLinesBeforeLineComments';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Line', function(comment) {
            if (comment.loc.start.line === 1) {
                return;
            }

            errors.assert.linesBetween({
                token: file.getPrevToken(comment, {includeComments: true}),
                nextToken: comment,
                atLeast: 2,
                message: 'Line comments must be preceded with a blank line'
            });
        });
    }
};
