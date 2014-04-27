var assert = require('assert');

module.exports = function() {};

/**
 * @rule disallowPaddingNewlinesInBlocks
 * @description
 * Disallows blocks from beginning and ending with 2 newlines.
 *
 * Type: `Boolean`
 *
 * Values: `true` validates all non-empty blocks.
 *
 * @example <caption>Example:</caption>
 * "disallowPaddingNewlinesInBlocks": true
 * @example <caption>Valid:</caption>
 * if (true) {
 *   doSomething();
 * }
 * if (true) {doSomething();}
 * var abc = function() {};
 * @example <caption>Invalid:</caption>
 * if (true) {
 *
 *   doSomething();
 *
 * }
 */
module.exports.prototype = {

    configure: function(disallowPaddingNewlinesInBlocks) {
        assert(
            disallowPaddingNewlinesInBlocks === true,
            'disallowPaddingNewlinesInBlocks option requires the value true or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowPaddingNewlinesInBlocks';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length === 0) {
                return;
            }

            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (openingBracket.loc.start.line + 1 < nextToken.loc.start.line) {
                errors.add('Expected no padding newline after opening curly brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line > prevToken.loc.start.line + 1) {
                errors.add('Expected no padding newline before closing curly brace', prevToken.loc.end);
            }
        });
    }

};
