/**
 * Requires blocks to begin and end with 2 newlines
 *
 * Type: `Boolean` or `Integer`
 *
 * Values: `true` validates all non-empty blocks,
 * `Integer` specifies a minimum number of statements in the block before validating.
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewlinesInBlocks": true
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * if (true) {
 *
 *     doSomething();
 *
 * }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) {doSomething();}
 * if (true) {
 *     doSomething();
 * }
 * ```
 *
 * ##### Valid for mode `1`
 *
 * ```js
 * if (true) {
 *
 *     doSomething();
 *     doSomethingElse();
 *
 * }
 * if (true) {
 *     doSomething();
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) { doSomething(); doSomethingElse(); }
 * if (true) {
 *     doSomething();
 *     doSomethingElse();
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

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

            var openingBracket = file.getFirstNodeToken(node);
            var nextToken = file.getCommentAfterToken(openingBracket) || file.getNextToken(openingBracket);

            if (nextToken.loc.start.line - openingBracket.loc.start.line < 2) {
                errors.add('Expected a padding newline after opening curly brace', openingBracket.loc.end);
            }

            var closingBracket = file.getLastNodeToken(node);
            var prevToken = file.getCommentBeforeToken(closingBracket) || file.getPrevToken(closingBracket);

            if (closingBracket.loc.start.line - prevToken.loc.start.line < 2) {
                errors.add('Expected a padding newline before closing curly brace', prevToken.loc.end);
            }
        });
    }

};
