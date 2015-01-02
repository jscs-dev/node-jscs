var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowSpaceBeforeBlockStatements) {
        assert(
            typeof disallowSpaceBeforeBlockStatements === 'boolean',
            'disallowSpaceBeforeBlockStatements option requires boolean value'
        );
        assert(
            disallowSpaceBeforeBlockStatements === true,
            'disallowSpaceBeforeBlockStatements option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeBlockStatements';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            var body = file.getTokenByRangeStart(node.range[0]);
            var previous = file.getPrevToken(body);

            // A bare block can start the file with no space before it
            var noSpaceBeforeFirstTokenInFile = !previous && body.range[0] > 0;
            var noSpaceBeforeToken = previous && previous.range[1] !== body.range[0];

            if (noSpaceBeforeToken || noSpaceBeforeFirstTokenInFile) {
                errors.add(
                    'Extra space before opening curly brace for block expressions',
                    node.loc.start
                );
            }
        });
    }

};
