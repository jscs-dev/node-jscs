/**
 * Disallows newline before line comments
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowPaddingNewLinesBeforeLineComments": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = 2;
 * // comment
 * return a;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 2;
 *
 * //comment
 * return a;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        assert(
            typeof value === 'boolean',
            'disallowPaddingNewLinesBeforeLineComments option requires boolean value'
        );
        assert(
            value === true,
            'disallowPaddingNewLinesBeforeLineComments option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowPaddingNewLinesBeforeLineComments';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Line', function(comment) {
            if (comment.loc.start.line === 1) {
                return;
            }

            var prevToken = file.getPrevToken(comment, {
                includeComments: true
            });

            errors.assert.linesBetween({
                token: prevToken,
                nextToken: comment,
                atMost: 1,
                message: 'Line comments must not be preceeded with a blank line'
            });
        });
    }
};
