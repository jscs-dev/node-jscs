var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireLineFeedAtFileEnd) {
        assert(
            typeof requireLineFeedAtFileEnd === 'boolean',
            'require_line_feed_at_file_end option requires boolean value'
        );
        assert(
            requireLineFeedAtFileEnd === true,
            'require_line_feed_at_file_end option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'require_line_feed_at_file_end';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        if (lines[lines.length - 1] !== '') {
            errors.add('Missing line feed at file end', lines.length, 0);
        }
    }

};
