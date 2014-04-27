var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow trailing whitespace
 * @description
 * Requires all lines to end on a non-whitespace character
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [trailing](http://jshint.com/docs/options/#trailing)
 *
 * @example <caption>Example:</caption>
 * "disallowTrailingWhitespace": true
 * @example <caption>Valid:</caption>
 * var foo = "blah blah";
 * @example <caption>Invalid:</caption>
 * var foo = "blah blah"; //<-- whitespace character here
 */
module.exports.prototype = {

    configure: function(disallowTrailingWhitespace) {
        assert(
            typeof disallowTrailingWhitespace === 'boolean',
            'disallowTrailingWhitespace option requires boolean value'
        );
        assert(
            disallowTrailingWhitespace === true,
            'disallowTrailingWhitespace option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowTrailingWhitespace';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        for (var i = 0, l = lines.length; i < l; i++) {
            if (lines[i].match(/\s$/)) {
                errors.add('Illegal trailing whitespace', i + 1, lines[i].length);
            }
        }
    }

};
