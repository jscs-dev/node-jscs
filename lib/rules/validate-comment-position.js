/**
 * Rules to validate the positioning of comments about a statement
 *
 * This rule is for validating the positioning of line comments. Block comments are ignored.
 *
 * Comments that start with the following keywords are also ignored:
 * `eslint`, `jshint`, `jslint`, `istanbul`, `global`, `exported`, `jscs`, `falls through`
 * eg. // jshint strict: true
 *
 * Type: `Object`
 *
 * Value:
 *
 * - `Object`:
 *    - `mode`: `above` or `beside`
 *    - `allExcept`: array of quoted exceptions
 *
 * #### Example
 *
 * ```js
 * "validateCommentPosition": { mode: `above`, allExcept: [`pragma`] }
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
 * 2 + 2; // pragma (this comment is fine)
 * ```
 *
 * ```js
 * "validateCommentPosition": { mode: `beside` }
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

var inlineConfigurationKeywords = require('../utils').inlineConfigurationKeywords;

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var modes = {
            'above': 'above',
            'beside': 'beside'
        };
        var allExcept = options.allExcept;
        this._exceptions = inlineConfigurationKeywords;
        assert(
            typeof options === 'object' && modes[options.mode],
            this.getOptionName() + ' requires one of the following values: ' + Object.keys(modes).join(', ')
        );
        if (Array.isArray(allExcept)) {
            assert(
                allExcept.every(function(el) { return typeof el === 'string'; }),
                'Property `allExcept` in ' + allExcept + ' should be an array of strings'
            );
            this._exceptions = this._exceptions.concat(allExcept);
        }
        this._mode = options.mode;
    },

    getOptionName: function() {
        return 'validateCommentPosition';
    },

    check: function(file, errors) {

        function isExcepted(comment) {
            var trimmedComment = comment.trim();
            for (var i = 0; i < exceptions.length; i++) {
                if (trimmedComment.indexOf(exceptions[i]) >= 0) {
                    return true;
                }
            }
            return false;
        }

        var mode = this._mode;
        var exceptions = this._exceptions;

        file.iterateTokensByType('Line', function(comment) {
            if (isExcepted(comment.value)) {
                return;
            }
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
