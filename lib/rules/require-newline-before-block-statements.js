var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireNewlineBeforeBlockStatements) {
        assert(
            typeof requireNewlineBeforeBlockStatements === 'boolean',
            'requireNewlineBeforeBlockStatements option requires boolean value'
        );
        assert(
            requireNewlineBeforeBlockStatements === true,
            'requireNewlineBeforeBlockStatements option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireNewlineBeforeBlockStatements';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
		var tokens = file.getTokens();

		var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);
		var openingBracket = tokens[openingBracketPos];
		var prevToken = tokens[openingBracketPos - 1]

		if (openingBracket.loc.start.line === prevToken.loc.start.line) {
			errors.add(
			    'Missing newline before curly brace for block statement',
			    node.loc.start
			);
		}

        });
    }

};
