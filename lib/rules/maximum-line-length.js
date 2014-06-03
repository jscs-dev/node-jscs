var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(maximumLineLength) {
        this._tabSize = '';

        if (typeof maximumLineLength === 'object') {
            assert(
                typeof maximumLineLength.tabSize === 'number' &&
                typeof maximumLineLength.value === 'number',
                'maximumLineLength option requires the "tabSize" and "value" property to be defined'
            );

            this._maximumLineLength = maximumLineLength.value;
            var tabSize = maximumLineLength.tabSize;

            while (tabSize--) {
                this._tabSize += ' ';
            }

        } else {
            assert(
                typeof maximumLineLength === 'number',
                'maximumLineLength option requires number value'
            );

            this._maximumLineLength = maximumLineLength;
        }
    },

    getOptionName: function() {
        return 'maximumLineLength';
    },

    check: function(file, errors) {
        var maximumLineLength = this._maximumLineLength;
        var tabSize = this._tabSize;

        var lines = file.getLines();
        var line;

        for (var i = 0, l = lines.length; i < l; i++) {
            line = tabSize ? lines[i].replace( /\t/g, tabSize ) : lines[i];

            if (line.length > maximumLineLength) {
                errors.add(
                    'Line must be at most ' + maximumLineLength + ' characters',
                    i + 1,
                    lines[i].length
                );
            }
        }
    }

};
