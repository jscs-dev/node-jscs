var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMultipleLineBreaks) {
        assert(
            typeof disallowMultipleLineBreaks === 'boolean',
            'disallow_multiple_line_breaks option requires boolean value'
        );
        assert(
            disallowMultipleLineBreaks === true,
            'disallow_multiple_line_breaks option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'disallow_multiple_line_breaks';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        for (var i = 0, l = lines.length; i < l; i++) {
            var line = lines[i];
            if (line === '') {
                if (lines[i + 1] === '') {
                    errors.add('Multiple line break', i + 1, 0);
                }
            }
        }
    }

};
