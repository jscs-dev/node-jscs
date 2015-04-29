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

        if (options === 'beginningOfFileOnly') {
            this._atBOF = true;
            this._atEOF = false;
        } else if (options === 'endOfFileOnly') {
            this._atBOF = false;
            this._atEOF = true;
        } else {
            this._atBOF = true;
            this._atEOF = true;
        }
    },

    getOptionName: function() {
        return 'requirePaddingNewlinesInFiles';
    },

    check: function(file, errors) {
        if (this._atBOF && file.getLines()[0] !== '') {
            errors.add('Missing padding new line at beginning of file', 1, 0);
        }

        if (this._atEOF && file.getLines()[file.getLines().length - 2] !== '') {
            errors.add('Missing padding new line at end of file', 1, 0);
        }
    }
};
