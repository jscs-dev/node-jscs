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
        var lines = file.getLines();
        var comments = file.getComments();

        comments.forEach(function(comment) {
            if (comment.type !== 'Line') {
                return;
            }

            if (comment.loc.start.line === 1) {
                return;
            }

            var prevLine = lines[comment.loc.start.line - 2];

            if (prevLine === '') {
                errors.add('Line comments must not be preceeded with a blank line', comment.loc.start);
            }
        });
    }
};
