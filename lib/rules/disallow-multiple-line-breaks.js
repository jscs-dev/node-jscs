/**
 * Disallows multiple blank lines in a row.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowMultipleLineBreaks": true
 * ```
 *
 * ##### Valid
 * ```js
 * var x = 1;
 *
 * x++;
 * ```
 *
 * ##### Invalid
 * ```js
 * var x = 1;
 *
 *
 * x++;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            typeof options === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            options === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowMultipleLineBreaks';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        for (var i = 1, l = lines.length; i < l; i++) {
            var line = lines[i];
            if (line === '' && lines[i - 1] === '') {
                while (++i < l && lines[i] === '') {}
                errors.add('Multiple line break', i - 1, 0);
            }
        }
    }

};
