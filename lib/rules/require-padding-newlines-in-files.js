 /**
 * Requires the file to start and/or end with a newline.
 *
 * Types: `Boolean` or `String`
 *
 * Values: `true`, `"beginningOfFileOnly"` or `"endOfFileOnly"`
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewlinesInFiles": true
 * "requirePaddingNewlinesInFiles": "beginningOfFileOnly"
 * "requirePaddingNewlinesInFiles": "endOfFileOnly"
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === true || options === 'beginningOfFileOnly' || options === 'endOfFileOnly',
            this.getOptionName() + ' option requires value to be `true`, `beginningOfFileOnly` or `endOfFileOnly`'
        );

        this._atBOF = options === true || options === 'beginningOfFileOnly';
        this._atEOF = options === true || options === 'endOfFileOnly';
    },

    getOptionName: function() {
        return 'requirePaddingNewlinesInFiles';
    },

    check: function(file, errors) {
        var lines = file.getLines();

        if (this._atBOF && lines[0] !== '') {
            errors.add('Missing padding new line at beginning of file', 1, 0);
        }

        if (lines.length > 1 && this._atEOF && lines[lines.length - 2] !== '') {
            errors.add('Missing padding new line at end of file', lines.length - 2, 0);
        }
    }
};
