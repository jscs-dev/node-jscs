/**
 * Disallows blocks from beginning or ending with 2 newlines.
 *
 * Type: `Boolean`
 *
 * Value: `true` validates all non-empty blocks.
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

    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
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
                nextToken: file.getNextToken(openingBracket, {includeComments: true}),
                atMost: 1,
                message: 'Expected no padding newline after opening curly brace'
            });

            var closingBracket = file.getLastNodeToken(node);

            errors.assert.linesBetween({
                token: file.getPrevToken(closingBracket, {includeComments: true}),
                nextToken: closingBracket,
                atMost: 1,
                message: 'Expected no padding newline before closing curly brace'
            });
        });
    }

};
