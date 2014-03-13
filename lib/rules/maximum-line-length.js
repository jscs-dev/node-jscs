var assert = require('assert');

module.exports = function() {};

/**
 * @rule Maximum line length
 * @description
 * Requires all lines to be at most the number of characters specified
 *
 * Type: `Integer`
 *
 * Values: A positive integer
 *
 * JSHint: [maxlen](http://jshint.com/docs/options/#maxlen)
 *
 * @example <caption>Example:</caption>
 * "maximumLineLength": 40
 * @example <caption>Valid:</caption>
 * var aLineOf40Chars = 123456789012345678;
 * @example <caption>Invalid:</caption>
 * var aLineOf41Chars = 1234567890123456789;
 */
module.exports.prototype = {

    configure: function(maximumLineLength) {
        assert(
            typeof maximumLineLength === 'number',
            'maximumLineLength option requires number value'
        );

        this._maximumLineLength = maximumLineLength;
    },

    getOptionName: function() {
        return 'maximumLineLength';
    },

    check: function(file, errors) {
        var maximumLineLength = this._maximumLineLength;

        var lines = file.getLines();
        for (var i = 0, l = lines.length; i < l; i++) {
            if (lines[i].length > maximumLineLength) {
                errors.add('Line must be at most ' + maximumLineLength + ' characters', i + 1, 0);
            }
        }
    }

};
