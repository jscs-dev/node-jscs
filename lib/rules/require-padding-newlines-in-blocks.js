var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require padding newlines in block
 * @description
 * Requires blocks to begin and end with 2 newlines
 *
 * Type: `Boolean` or `Integer`
 *
 * Values: `true` validates all non-empty blocks, `Integer` specifies a minimum number of statements in the block
 * before validating.
 * @example <caption>Example:</caption>
 * "requirePaddingNewlinesInBlock": true
 * @example <caption>Valid:</caption>
 * if (true) {
 *
 *   doSomething();
 *
 * }
 * var abc = function() {};
 * @example <caption>Invalid:</caption>
 * if (true) {doSomething();}
 * if (true) {
 *   doSomething();
 * }
 * @example <caption>Valid for mode `1`:</caption>
 * if (true) {
 *
 *   doSomething();
 *   doSomethingElse();
 *
 * }
 * if (true) {
 *   doSomething();
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * @example <caption>Invalid for mode `1`:</caption>
 * if (true) { doSomething(); doSomethingElse(); }
 * if (true) {
 *   doSomething();
 *   doSomethingElse();
 * }
 */
module.exports.prototype = {

    configure: function(requirePaddingNewlinesInBlocks) {
        assert(
            requirePaddingNewlinesInBlocks === true || typeof requirePaddingNewlinesInBlocks === 'number',
            'requirePaddingNewlinesInBlocks option requires the value true or an Integer'
        );

        this._minStatements = requirePaddingNewlinesInBlocks === true ? 0 : requirePaddingNewlinesInBlocks;
    },

    getOptionName: function() {
        return 'requirePaddingNewlinesInBlocks';
    },

    check: function(file, errors) {
        var minStatements = this._minStatements;

        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length <= minStatements) {
                return;
            }

            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (openingBracket.loc.start.line + 2 !== nextToken.loc.start.line) {
                errors.add('Expected a padding newline after opening curly brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line !== prevToken.loc.start.line + 2) {
                errors.add('Expected a padding newline before closing curly brace', prevToken.loc.end);
            }
        });
    }

};
