var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requirePrecedingComma) {
        assert(
            typeof requirePrecedingComma === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            requirePrecedingComma === true,
            this.getOptionName() + ' option requires true or should be removed'
        );
    },

    getOptionName: function() {
        return 'requirePrecedingComma';
    },

    check: function(file, errors) {
        var lines = file.getLines();

        for (var i = 0, l = lines.length; i < l; i++) {
            var line = lines[i];
            if (line[line.length-1] == ","){
                errors.add('Succeeding Comma', i, line.length - 1);
            }
        }
    }

};
