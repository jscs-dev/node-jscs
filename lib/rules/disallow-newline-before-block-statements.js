var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowNewlineBeforeBlockStatements) {
        assert(
            typeof disallowNewlineBeforeBlockStatements === 'boolean',
            'disallowNewlineBeforeBlockStatements option requires boolean value'
        );
        assert(
            disallowNewlineBeforeBlockStatements === true,
            'disallowNewlineBeforeBlockStatements option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowNewlineBeforeBlockStatements';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            var tokens = file.getTokens();

            var openingBracePos = file.getTokenPosByRangeStart(node.range[0]);
            var openingBrace = tokens[openingBracePos];
            var prevToken = tokens[openingBracePos - 1];

            if (openingBrace.loc.start.line !== prevToken.loc.start.line) {
                errors.add(
                    'Newline before curly brace for block statement is disallowed',
                    node.loc.start
                );
            }
        });
    }
};
