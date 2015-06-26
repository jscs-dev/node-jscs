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
 * "requirePaddingNewlinesInBlocks": 1
 * "requirePaddingNewlinesInBlocks": { "open": true, "close": true }
 * "requirePaddingNewlinesInBlocks": { "open": false, "close": true }
 * "requirePaddingNewlinesInBlocks": { "open": true, "close": false }
 * ```
 *
 * ##### Valid for mode `true` or `{ "open": true, "close": true }`
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
 *  ```
 *
 * ##### Valid for mode `{ "open": false, "close": true }`
 *
 * ```js
 * if (true) {
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
 * if (true) {
 *
 *     doSomething();
 * }
 * ```
 *
  * ##### Valid for mode `{ "open": true, "close": false }`
 *
 * ```js
 * if (true) {
 *
 *     doSomething();
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
 * if (true) {
 *     doSomething();
 *
 * }
 * ```
 *
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true || typeof options === 'number' || typeof options === 'object',
            this.getOptionName() + ' option requires the value true, an Integer or an object'
        );

        this._checkOpen = true;
        this._checkClose = true;
        this._minStatements = 0;
        if (typeof options === 'object') {
            assert(typeof options.open === 'boolean' && typeof options.close === 'boolean',
                this.getOptionName() + ' option requires the "open" and "close" ' +
                 'properties to be booleans');

            assert(options.open || options.close,
                this.getOptionName() + ' option requires either one of  the "open" and "close" ' +
                 'properties to be true');

            this._checkOpen = options.open;
            this._checkClose = options.close;
        } else if (typeof options === 'number') {
            this._minStatements = options;
        }
    },

    getOptionName: function() {
        return 'requirePaddingNewlinesInBlocks';
    },

    check: function(file, errors) {
        var minStatements = this._minStatements;
        var checkOpen = this._checkOpen;
        var checkClose = this._checkClose;

        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length <= minStatements) {
                return;
            }

            if (checkOpen === true) {
                var openingBracket = file.getFirstNodeToken(node);

                errors.assert.linesBetween({
                    token: openingBracket,
                    nextToken: file.getNextToken(openingBracket, {includeComments: true}),
                    atLeast: 2,
                    message: 'Expected a padding newline after opening curly brace'
                });
            }

            if (checkClose === true) {
                var closingBracket = file.getLastNodeToken(node);

                errors.assert.linesBetween({
                    token: file.getPrevToken(closingBracket, {includeComments: true}),
                    nextToken: closingBracket,
                    atLeast: 2,
                    message: 'Expected a padding newline before closing curly brace'
                });
            }
        });
    }
};
