/**
 * Disallows blocks from beginning and ending with 2 newlines.
 *
 * Type: `Boolean`
 *
 * Values: `true` validates all non-empty blocks.
 *
 * #### Example
 *
 * ```js
 * "disallowPaddingNewlinesInBlocks": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (true) {
 *     doSomething();
 * }
 * if (true) {doSomething();}
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) {
 *
 *     doSomething();
 *
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

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
            var openingBracket = file.getFirstNodeToken(node);

            errors.assert.linesBetween({
                token: openingBracket,
                nextToken: file.getCommentAfterToken(openingBracket) || file.getNextToken(openingBracket),
                atMost: 1,
                message: 'Expected no padding newline after opening curly brace'
            });

            var closingBracket = file.getLastNodeToken(node);

            errors.assert.linesBetween({
                token: file.getCommentBeforeToken(closingBracket) || file.getPrevToken(closingBracket),
                nextToken: closingBracket,
                atMost: 1,
                message: 'Expected no padding newline before closing curly brace'
            });
        });
    }

};
