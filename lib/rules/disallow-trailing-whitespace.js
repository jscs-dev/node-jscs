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
        var lineTokens = file._tokensByLineIndex;
        var lines = file.getLines().length;
        var lastLine = 1;

        function checkTokenWhiteSpace(token) {
            var whitespace = token.whitespaceBefore;
            var subLines = whitespace.split(file.getLineBreakStyle());

            for (var l = 0; l < subLines.length; l++) {
                var subLine = subLines[l];

                if (l === subLines.length - 1 && token.type !== 'EOF') {
                    // skip check if it is a last whitespace line and not eof
                    break;
                }

                var isEmptyLine =
                    l  || // not first sub line (since there's prev tokens on line)
                        token._tokenIndex === 0 && l === 0 // first token exception
                ;

                if (subLine.length && !(ignoreEmptyLines && isEmptyLine)) {
                    errors.assert.emit('error', {
                        message: 'Illegal trailing whitespace',
                        line: lastLine + l,
                        column: subLine.length,
                        fixed: true
                    });
                    subLines[l] = '';
                }
            }

            token.whitespaceBefore = subLines.join(file.getLineBreakStyle());
        }

        for (var i = 1; i <= lines; i++) {
            if (!lineTokens[i]) {
                continue;
            }

            var line = lineTokens[i];
            // check first line token
            var token = line[0];
            checkTokenWhiteSpace(token);

            // check last line token
            token = line[line.length - 1];
            if (token.isComment && token.type === 'Line') {
                // line comment
                if (token.value.match(/\s+$/)) {
                    errors.assert.emit('error', {
                        message: 'Illegal trailing whitespace',
                        line: i,
                        column: token.loc.end.column,
                        fixed: true
                    });

                    token.value = token.value.replace(/\s+$/, '');
                }
            } else if (token.isComment && token.type === 'Block') {
                // block comment
                var subLines = token.value.split(file.getLineBreakStyle());
                for (var l = 0; l < subLines.length - 1; l++) {
                    var subLine = subLines[l];

                    if (subLine.match(/\s$/) && !(ignoreEmptyLines && l && subLine.match(/^\s*$/))) {
                        errors.assert.emit('error', {
                            message: 'Illegal trailing whitespace',
                            line: i + l,
                            column: subLine.length,
                            fixed: true
                        });

                        subLines[l] = subLine.replace(/\s+$/, '');
                    }
                }
                token.value = subLines.join(file.getLineBreakStyle());
            } else if (token.type === 'EOF') {
                // non new line eof
                checkTokenWhiteSpace(token);
            }

            lastLine = i;
        }
    }
};
