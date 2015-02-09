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
            typeof value === 'boolean',
            'requirePaddingNewLinesBeforeLineComments option requires boolean value'
        );
        assert(
            value === true,
            'requirePaddingNewLinesBeforeLineComments option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requirePaddingNewLinesBeforeLineComments';
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

            if (prevLine !== '') {
                errors.add('Line comments must be preceeded with a blank line', comment.loc.start);
            }
        });
    }
};
