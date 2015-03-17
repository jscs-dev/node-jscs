/**
 * Option to check line break characters
 *
 * Type: `String`
 *
 * Values: `"CR"`, `"LF"`, `"CRLF"`
 *
 * #### Example
 *
 * ```js
 * "validateLineBreaks": "LF"
 * ```
 *
 * ##### Valid
 * ```js
 * var x = 1;<LF>
 * x++;
 * ```
 *
 * ##### Invalid
 * ```js
 * var x = 1;<CRLF>
 * x++;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            typeof options === 'string' || typeof options === 'object',
            this.getOptionName() + ' option requires string or object value'
        );

        if (typeof options === 'string') {
            options = { character: options };
        }

        var lineBreaks = {
            CR: '\r',
            LF: '\n',
            CRLF: '\r\n'
        };
        this._allowedLineBreak = lineBreaks[options.character];

        this._reportOncePerFile = options.reportOncePerFile !== false;
    },

    getOptionName: function() {
        return 'validateLineBreaks';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        if (lines.length < 2) {
            return;
        }

        file.getLineBreaks().some(function(lineBreak, i) {
            if (lineBreak !== this._allowedLineBreak) {
                errors.add('Invalid line break', i + 1, lines[i].length);
                return this._reportOncePerFile;
            }
        }, this);
    }

};
