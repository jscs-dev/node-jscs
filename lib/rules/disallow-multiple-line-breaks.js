var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow multiple line breaks
 * @description
 * Disallows multiple blank lines in a row.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * @example <caption>Example:</caption>
 * "disallowMultipleLineBreaks": true
 * @example <caption>Valid:</caption>
 * var x = 1;
 * x++;
 * @example <caption>Invalid:</caption>
 * var x = 1;
 * x++;
 */
module.exports.prototype = {

    configure: function(disallowMultipleLineBreaks) {
        assert(
            typeof disallowMultipleLineBreaks === 'boolean',
            'disallowMultipleLineBreaks option requires boolean value'
        );
        assert(
            disallowMultipleLineBreaks === true,
            'disallowMultipleLineBreaks option requires true value or should be removed'
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
