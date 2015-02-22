/**
 * Requires newline before line comments
 *
 * Type: `Boolean`
 *
 * Values:
 * - `true`: always require a newline before line comments
 * - `Object`:
 *      - `"allExcept"`: `"firstInBlock"` Comments may be first line of block without extra padding
 *
 * #### Examples
 * ```js
 * "requirePaddingNewLinesBeforeLineComments": true
 * "requirePaddingNewLinesBeforeLineComments": { "allExcept": "firstInBlock" }
 * ```
 *
 * ##### Valid for `true`
 *
 * ```js
 * var a = 2;
 *
 * // comment
 * return a;
 *
 * function() {
 *
 *   // comment
 * }
 * ```
 *
 * ##### Valid for `{ "allExcept": "firstInBlock" }`
 *
 * ```js
 * var a = 2;
 *
 * // comment
 * return a;
 *
 * function() {
 *   // comment
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 2;
 * //comment
 * return a;
 *
 * function() {
 *   // comment
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        this._allowFirstInBlock = false;

        if (typeof value === 'object') {
            assert(typeof value.allExcept === 'string' && value.allExcept === 'firstInBlock',
                'requirePaddingNewLinesBeforeLineComments option requires the "allExcept" ' +
                 'property to equal "firstInBlock"');
            this._allowFirstInBlock = true;
        } else {
            assert(value === true,
                'requirePaddingNewLinesBeforeLineComments option requires true value or object'
            );
        }
    },

    getOptionName: function() {
        return 'requirePaddingNewLinesBeforeLineComments';
    },

    check: function(file, errors) {
        var allowFirstInBlock = this._allowFirstInBlock;

        file.iterateTokensByType('Line', function(comment) {
            if (comment.loc.start.line === 1) {
                return;
            }

            var prevToken = file.getPrevToken(comment, {
                includeComments: true
            });

            if (prevToken.type === 'Line') {
                return;
            }

            if (allowFirstInBlock && prevToken.type === 'Punctuator' && prevToken.value === '{') {
                return;
            }

            errors.assert.linesBetween({
                token: prevToken,
                nextToken: comment,
                atLeast: 2,
                message: 'Line comments must be preceded with a blank line'
            });
        });
    }
};
