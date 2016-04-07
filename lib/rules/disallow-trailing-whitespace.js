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
var Token = require('cst').Token;

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
        var program = file.getProgram();

        if (!program) {
            return;
        }

        var lastToken = program.getLastToken();
        if (lastToken && lastToken.type === 'EOF') {
            lastToken = lastToken.getPreviousToken();
        }
        program.selectTokensByType('Whitespace').forEach(function(whitespace) {
            whitespace.getValueLineInfo().some(function(line, i) {
                if (this._ignoreEmptyLines && i > 0) {
                    return true;
                }
                if (line.text && (line.lineBreak || whitespace === lastToken)) {
                    errors.cast({
                        message: 'Illegal trailing whitespace',
                        element: whitespace,
                        offset: line.offset,
                        additional: {
                            lineNumber: i
                        }
                    });
                }
            }, this);
        }, this);
        program.selectTokensByType('CommentBlock').concat(program.selectTokensByType('CommentLine'))
            .forEach(function(comment) {
                var lines = comment.getValueLineInfo();
                lines.forEach(function(line, i) {
                    if (i > 0 && this._ignoreEmptyLines && line.text.trim() === '') {
                        return;
                    }
                    if (comment.type === 'CommentBlock' && i === lines.length - 1) {
                        return;
                    }
                    if (line.text.match(/\s$/)) {
                        errors.cast({
                            message: 'Illegal trailing comment',
                            element: comment,
                            offset: line.offset,
                            additional: {
                                lineNumber: i
                            }
                        });
                    }
                }, this);
            }, this);
    },

    _fix: function(file, error) {
        var element = error.element;
        var newValue;
        var lines = element.getValueLineInfo();
        var line = lines[error.additional.lineNumber];
        if (element.isWhitespace) {
            line.text = '';
        }
        if (element.isComment) {
            line.text = line.text.replace(/\s+$/, '');
        }

        newValue = lines.map(function(line) {
            return line.text + (line.lineBreak || '');
        }).join('');

        var newElement = new Token(element.type, newValue);
        element.parentElement.replaceChild(newElement, element);
    }
};
