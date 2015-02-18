/**
 * Requires blocks to begin and end with a newline
 *
 * Type: `Boolean` or `Integer`
 *
 * Values: `true` validates all non-empty blocks,
 * `Integer` specifies a minimum number of statements in the block before validating.
 *
 * #### Example
 *
 * ```js
 * "requireBlocksOnNewline": true
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * if (true) {
 *     doSomething();
 * }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) {doSomething();}
 * ```
 *
 * ##### Valid for mode `1`
 *
 * ```js
 * if (true) {
 *     doSomething();
 *     doSomethingElse();
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) { doSomething(); doSomethingElse(); }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

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

            var openingBracket = file.getFirstNodeToken(node);
            var nextToken = file.getNextToken(openingBracket);

            errors.assert.differentLine({
                token: openingBracket,
                nextToken: nextToken,
                message: 'Missing newline after opening curly brace'
            });

            var closingBracket = file.getLastNodeToken(node);
            var prevToken = file.getPrevToken(closingBracket);

            errors.assert.differentLine({
                token: prevToken,
                nextToken: closingBracket,
                message: 'Missing newline before closing curly brace'
            });
        });
    }

};
