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

var cst = require('cst');

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
                errors.add(
                    'Illegal trailing whitespace',
                    file.getLastTokenOnLine(i + 1, {
                        includeComments: true,
                        includeWhitespace: true
                    })
                );
            }
        }
    },

    _fix: function(file, error) {
        var ignoreEmptyLines = this._ignoreEmptyLines;
        var currentLineNumber = error.line;
        var linebreak = file.getLineBreakStyle();
        var lines = file.getLines();

        var fixed = false;
        var startLineNumber;
        var precedingToken;
        var targetToken;
        var newValue;

        while (!precedingToken && currentLineNumber > 0) {
            precedingToken = file.getLastTokenOnLine(currentLineNumber, {
                includeComments: true
            });
            currentLineNumber--;
        }

        if (precedingToken === null) {
            targetToken = file.getFirstToken({includeComments: true});
            startLineNumber = 1;
        } else {
            targetToken = file.getNextToken(precedingToken, {
                includeComments: true
            });
            startLineNumber = precedingToken.loc.end.line;

            if (precedingToken.isComment &&
                precedingToken.loc.start.line <= error.line &&
                precedingToken.loc.end.line >= error.line) {

                if (precedingToken.type === 'Block') {

                    if (ignoreEmptyLines) {
                        var blockLines = precedingToken.value.split(/\r\n|\n|\r/);

                        for (var k = 0; k < blockLines.length; k++) {

                            if (!blockLines[k].match(/^\s*$/) || k === 0) {
                                blockLines[k] = blockLines[k].split(/\s+$/).join('');
                            }
                        }

                        newValue = blockLines.join(linebreak);
                    } else {
                        newValue = precedingToken.value
                            .split(/[^\S\r\n]+\r\n|[^\S\n]+\n|[^\S\r]+\r/)
                            .join(linebreak);
                    }
                } else {
                    newValue = precedingToken.value.split(/\s+$/).join('');
                }

                file.setWhitespaceBefore(precedingToken.nextToken, newValue);
                fixed = true;
            }
        }

        if (targetToken !== null && !fixed) {
            var eolCount = targetToken.loc.start.line - startLineNumber + 1;
            var targetIndent = '';
            var targetLine = lines[targetToken.loc.start.line - 1];
            for (var j = 0, whitespace = targetLine.charAt(j);
                 whitespace.match(/\s/);
                 j++, whitespace = targetLine.charAt(j)) {
                targetIndent += whitespace;
            }

            file.setWhitespaceBefore(targetToken, new Array(eolCount).join(linebreak) + targetIndent);
            fixed = true;
        }

        if (!fixed && precedingToken && precedingToken.type === 'EOF') {
            precedingToken = precedingToken.previousToken;
            if (precedingToken.isWhitespace) {
                newValue = precedingToken.sourceCode.replace(/ /g, '');
                file.setWhitespaceBefore(precedingToken.nextToken, newValue);
                fixed = true;
            }
        }

        if (!fixed) {
            error.fixed = false;
        }
    }
};
