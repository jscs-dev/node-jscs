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
        var lines = file.getLines();

        file.iterateNodesByType('BlockStatement', function(node) {
            var openingBracket = file.getFirstNodeToken(node);
            var startLine = openingBracket.loc.start.line;

            var closingBracket = file.getLastNodeToken(node);
            var closingLine = closingBracket.loc.start.line;

            if (startLine === closingLine) {
                return;
            }

            if (lines[startLine] === '') {
                errors.add('Expected no padding newline after opening curly brace', openingBracket.loc.end);
            }

            if (lines[closingLine - 2] === '') {
                errors.add('Expected no padding newline before closing curly brace', closingBracket.loc.start);
            }
        });
    }

};
