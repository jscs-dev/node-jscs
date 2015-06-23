/**
 * Requires all lines to end on a non-whitespace character
 *
 * Types: `Boolean` or `String`
 *
 * Values:
 *  - `true`
 *  - `"ignoreEmptyLines"`: (default: `false`) allow whitespace on empty lines
 *
 * JSHint: [`trailing`](http://jshint.com/docs/options/#trailing)
 *
 * #### Example
 *
 * ```js
 * "disallowTrailingWhitespace": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var foo = "blah blah";
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var foo = "blah blah"; //<-- whitespace character here
 * ```
 *
 * ##### Valid for `true`
 *
 * ```js
 * foo = 'bar';
 *
 * foo = 'baz';
 * ```
 *
 * ##### Invalid for `true` but Valid for `ignoreEmptyLines`
 *
 * ```js
 * foo = 'bar';
 * \t
 * foo = 'baz';
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true || options === 'ignoreEmptyLines',
            this.getOptionName() + ' option requires a true value or "ignoreEmptyLines"'
        );
        this._ignoreEmptyLines = options === 'ignoreEmptyLines';
    },

    getOptionName: function() {
        return 'disallowTrailingWhitespace';
    },

    check: function(file, errors) {
        var ignoreEmptyLines = this._ignoreEmptyLines;
        var lines = file.getLines();
        for (var i = 0, l = lines.length; i < l; i++) {
            if (lines[i].match(/\s$/) && !(ignoreEmptyLines && lines[i].match(/^\s*$/))) {
                var fixed = false;
                var currentLineNumber = i + 1;
                var precendingToken;
                var targetToken;
                while (!precendingToken && currentLineNumber > 0) {
                    precendingToken = file.getLastTokenOnLine(currentLineNumber, {includeComments: true});
                    currentLineNumber--;
                }

                if (typeof precendingToken === 'undefined') {
                    targetToken = file.getFirstToken();
                } else {
                    targetToken = file.getNextToken(precendingToken, {includeComments: true});
                }

                if (precendingToken.isComment && 
                    precendingToken.loc.start.line <= (i + 1) && 
                    precendingToken.loc.end.line >= (i + 1)) {
                    precendingToken = undefined;
                    continue; // ignore whitespaces in comments
                }

                if (typeof targetToken !== 'undefined') {
                    var eolCount = targetToken.loc.start.line - precendingToken.loc.end.line + 1;
                    var targetIndent = '';
                    var targetLine = lines[targetToken.loc.start.line - 1];
                    for (var j = 0, whitespace = targetLine.charAt(j);
                        whitespace.match(/\s/);
                        j++, whitespace = targetLine.charAt(j)) {
                        targetIndent += whitespace;
                    }
                    targetToken.whitespaceBefore = Array(eolCount).join('\n') + targetIndent;
                    fixed = true;
                }
                precendingToken = undefined;
                errors.add('Illegal trailing whitespace', i + 1, lines[i].length, fixed);
            }
        }
    }
};
