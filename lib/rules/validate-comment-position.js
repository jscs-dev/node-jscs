/**
 * Rules to validate the positioning of comments about a statement
 *
 * Type: `String`
 *
 * Value:
 *
 * - `above`
 * - `beside`
 *
 * #### Example
 *
 * ```js
 * "validateCommentPosition": `above`
 * ```
 *
 * ##### Valid
 *
 * ```js
 * // This is a valid comment
 * 1 + 1;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * 1 + 1; // This is an invalid comment
 * ```
 *
 * ```js
 * "validateCommentPosition": `beside`
 * ```
 *
 * ##### Valid
 *
 * ```js
 * 1 + 1; // This is a valid comment
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * // This is an invalid comment
 * 1 + 1;
 * ```
*/

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'above': 'above',
            'beside': 'beside'
        };
        assert(
            typeof value === 'string' || modes[mode],
            this.getOptionName() + ' requires one of the following values: ' + Object.keys(modes).join(', ')
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'validateCommentPosition';
    },

    check: function(file, errors) {
        var mode = this._mode;
        file.iterateTokensByType('Line', function(comment) {
            var firstToken = file.getFirstTokenOnLine(comment.loc.start.line, { includeComments: true });
            if (mode === 'above' && !firstToken.isComment) {
                errors.add('Expected comments to be above the code not beside', comment.loc.start);
            }
            if (mode === 'beside' && firstToken.isComment) {
                errors.add('Expected comments to be beside the code not above', comment.loc.start);
            }
        });
    }
};
