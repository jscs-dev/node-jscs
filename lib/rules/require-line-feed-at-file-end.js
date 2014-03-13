var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require line feed at file end
 * @description
 * Requires placing line feed at file end.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * @example <caption>Example:</caption>
 * "requireLineFeedAtFileEnd": true
 */
module.exports.prototype = {

    configure: function(requireLineFeedAtFileEnd) {
        assert(
            typeof requireLineFeedAtFileEnd === 'boolean',
            'requireLineFeedAtFileEnd option requires boolean value'
        );
        assert(
            requireLineFeedAtFileEnd === true,
            'requireLineFeedAtFileEnd option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireLineFeedAtFileEnd';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        if (lines[lines.length - 1] !== '') {
            errors.add('Missing line feed at file end', lines.length, 0);
        }
    }

};
