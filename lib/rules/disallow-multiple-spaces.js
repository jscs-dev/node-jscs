var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMultipleSpaces) {
        assert(
            typeof disallowMultipleSpaces === 'boolean',
            'disallowMultipleSpaces option requires boolean value'
        );
        assert(
            disallowMultipleSpaces === true,
            'disallowMultipleSpaces option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowMultipleSpaces';
    },

    check: function(file, errors) {
        var lines = file.getLines();

        for (var i = 0, l = lines.length; i < l; i++) {
            var trimedLine = lines[i].trim();
            if (trimedLine.match(/\s{2,}(?=(?:(?:[^"]*"){2})*[^"]*$)(?=(?:(?:[^']*'){2})*[^']*$)/g)) {
                errors.add('Multiple spaces', i + 1, lines[i].length);
            }
        }

    }
};
