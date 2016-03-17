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

        var stripTrailingWs = ignoreEmptyLines ?
            function(line) {
                return line.match(/^\s*$/) ? line : line.trimRight();
            }
            : Function.prototype.call.bind(String.prototype.trimRight);

        var fixed = false;
        var eolCount;
        var startLineNumber;
        var Token;
        var precedingToken;
        var targetToken;
        var newValue;
        var replacementToken;

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

                var sourceCode = precedingToken.sourceCodeLines
                    .map(stripTrailingWs)
                    .join(linebreak);

                // Remove `/*`, `*/` and `//` parts
                var isBlock = precedingToken.type === 'CommentBlock';
                newValue = sourceCode.slice(2, (-2 * isBlock) || undefined);

                // Make a replacement for existing token
                Token = precedingToken.constructor;
                replacementToken = new Token(precedingToken.type, newValue);

                precedingToken.parentElement.replaceChild(replacementToken, precedingToken);
                fixed = true;
            }
        }

        if (targetToken !== null && targetToken.isWhitespace && !fixed) {
            eolCount = targetToken.loc.end.line - targetToken.loc.start.line + 1;
            newValue = new Array(eolCount).join(linebreak);

            Token = targetToken.constructor;
            replacementToken = new Token(targetToken.type, newValue);

            targetToken.parentElement.replaceChild(replacementToken, targetToken);
            fixed = true;
        }

        if (targetToken !== null && !fixed) {
            eolCount = targetToken.loc.start.line - startLineNumber + 1;
            newValue = new Array(eolCount).join(linebreak);
            newValue += lines[targetToken.loc.start.line - 1].replace(/^(\s*).*?$/, '$1');

            file.setWhitespaceBefore(targetToken, newValue);
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
