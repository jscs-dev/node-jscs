/**
 * Requires blocks to begin and end with 2 newlines
 *
 * Types: `Boolean` or `Integer`
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

    configure: function(options) {
        assert(
            options === true || typeof options === 'number',
            this.getOptionName() + ' option requires the value true or an Integer'
        );

        this._minStatements = options === true ? 0 : options;
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

            errors.assert.linesBetween({
                token: openingBracket,
                nextToken: file.getNextToken(openingBracket, {includeComments: true}),
                atLeast: 2,
                message: 'Expected a padding newline after opening curly brace'
            });

            var closingBracket = file.getLastNodeToken(node);

            errors.assert.linesBetween({
                token: file.getPrevToken(closingBracket, {includeComments: true}),
                nextToken: closingBracket,
                atLeast: 2,
                message: 'Expected a padding newline before closing curly brace'
            });
        });
    }

};
