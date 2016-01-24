/**
 * Requires imports to be alphabetised
 *
 * Types: `Boolean`
 *
 * Values: `true` to require imports to be ordered (A-Z)
 *
 * #### Example
 *
 * ```js
 * "requireImportAlphabetized": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * import a from 'a';
 * import c from 'c';
 * import z from 'z';
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * import a from 'a';
 * import z from 'z';
 * import c from 'c';
 * ```
 */

var assert = require('assert');

module.exports = function() {
};

module.exports.prototype = {

    configure: function(option) {
        assert(
            option === true,
            this.getOptionName() + ' option requires true value'
        );
    },

    getOptionName: function() {
        return 'requireImportAlphabetized';
    },

    check: function(file, errors) {
        var previous;
        var current;

        var lines = file.getLines();

        for (var i = 0, l = lines.length; i < l; i++) {

            if (lines[i].match(/import.*$/)) {

                current = lines[i].trim();

                if (previous && previous > current) {
                    errors.cast({
                        message: 'imports must be alphabetized',
                        line: i + 1,
                        column: lines[i].length
                    });
                }

                previous = current;
            }
        }
    }

};
