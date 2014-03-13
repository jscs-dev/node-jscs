var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require blocks on newline
 * @description
 * Requires blocks to begin and end with a newline
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * @example <caption>Example:</caption>
 * "requireBlocksOnNewline": true
 * @example <caption>Valid:</caption>
 * if (true) {
*     doSomething();
* }
 * var abc = function() {};
 * @example <caption>Invalid:</caption>
 * if (true) {doSomething();}
 */
module.exports.prototype = {

    configure: function(requireBlocksOnNewline) {
        assert(
            requireBlocksOnNewline === true || typeof requireBlocksOnNewline === 'number',
            'requireBlocksOnNewline option requires the value true or an Integer'
        );

        this._minStatements = requireBlocksOnNewline === true ? 0 : requireBlocksOnNewline;
    },

    getOptionName: function() {
        return 'requireBlocksOnNewline';
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

            if (openingBracket.loc.start.line === nextToken.loc.start.line) {
                errors.add('Missing newline after opening curly brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line === prevToken.loc.start.line) {
                errors.add('Missing newline before closing curly brace', prevToken.loc.end);
            }
        });
    }

};
