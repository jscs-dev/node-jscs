/**
 * Requires function's expressions to begin and end with 2 newlines
 *
 * Types: `Boolean`, `Integer`, `Object`
 *
 * Values:
 *  - `true` validates all non-empty function's expressions
 *  - `Integer` specifies a minimum number of lines containing elements in the function's expression before validating
 *  - `Object` (at least one of properties must be true):
 *      - `'open'`
 *          - `true` validates that there is a newline after the opening brace in a function's expression
 *          - `false` ignores the newline validation after the opening brace in a function's expression
 *      - `'close'`
 *          - `true` validates that there is a newline before the closing brace in a function's expression
 *          - `false` ignores the newline validation before the closing brace in a function's expression
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewlinesInFunctionExpressions": { "open": true, "close": false }
 * ```
 *
 * ##### Valid for mode `true` or `{ "open": true, "close": true }`
 *
 * ```js
 * function () {
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
 * function () {doSomething();}
 * function () {
 *     doSomething();
 * }
 * ```
 *
 * ##### Valid for mode `1`
 *
 * ```js
 * function () {
 *
 *     doSomething();
 *     doSomethingElse();
 *
 * }
 * function () {
 *     doSomething();
 * }
 * function () { doSomething(); }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function () { doSomething(); doSomethingElse(); }
 * function () {
 *     doSomething();
 *     doSomethingElse();
 * }
 *  ```
 *
 * ##### Valid for mode `{ "open": false, "close": true }`
 *
 * ```js
 * function () {
 *     doSomething();
 *
 * }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function () {doSomething();}
 * function () {
 *     doSomething();
 * }
 * function () {
 *
 *     doSomething();
 * }
 * ```
 *
  * ##### Valid for mode `{ "open": true, "close": false }`
 *
 * ```js
 * function () {
 *
 *     doSomething();
 * }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function () {doSomething();}
 * function () {
 *     doSomething();
 * }
 * function () {
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
        return 'requirePaddingNewlinesInFunctionExpressions';
    },

    check: function(file, errors) {
        var minStatements = this._minStatements;
        var checkOpen = this._checkOpen;
        var checkClose = this._checkClose;

        file.iterateNodesByType('FunctionExpression', function(node) {
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
