var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSpacesInsideParentheses) {
        assert(
            typeof disallowSpacesInsideParentheses === 'boolean',
            'disallowSpacesInsideParentheses option requires boolean value'
        );
        assert(
            disallowSpacesInsideParentheses === true,
            'disallowSpacesInsideParentheses option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpacesInsideParentheses';
    },

    check: function(file, errors) {

        var re = /\( | \)/,
            reLeft = /\( /g,
            reRight = /\S +\)/g,
            match;

        if (re.test(file._source)) {
            file._source.split('\n').forEach(function(line, index) {
                // jshint boss: true

                reLeft.lastIndex = 0;
                while (match = reLeft.exec(line)) {
                    errors.add('Illegal space after opening round bracket', {
                        line: index + 1,
                        column: match.index + 1
                    });
                }

                reRight.lastIndex = 0;
                while (match = reRight.exec(line)) {
                    errors.add('Illegal space before closing round bracket', {
                        line: index + 1,
                        column: match.index + 1
                    });
                }

            });
        }

    }

};
