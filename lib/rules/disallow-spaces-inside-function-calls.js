/**
 * Disallows space after opening and before closing function call parentheses.
 *
 * Types: `Boolean` or `Object`
 *
 * Values:
 * - true
 * - `Object`:
 *      - "only": An array containing tokens to disallow.
 *      - "onlySingleArgument": true
 *      - "onlyMultipleArguments": true
 *
 * #### Example
 *
 * ```js
 * "disallowSpacesInsideFunctionCalls": true
 *
 * // or
 *
 * "disallowSpacesInsideFunctionCalls": {
 *     "allExcept": [ "'", "\'" ]
 * }
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * doSomething(foo);
 * ```
 *
 * ##### Valid for mode `{ only": [ "\'" ] }`
 *
 * ```js
 * doSomething('foo');
 * doSomething( bar );
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * doSomething( 'foo' );
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(value) {
        var isObject = typeof value === 'object';

        var error = this.getOptionName() + ' rule requires string value true or object';

        var validFlags = [
            'only',
            'onlySingleArgument',
            'onlyMultipleArguments'
        ];

        if (isObject) {
            var hasValidFlags;

            validFlags.forEach(function(flag) {
                hasValidFlags = hasValidFlags || flag in value;
            });

            assert(hasValidFlags, error);
        } else {
            assert(value === true, error);
        }

        if (isObject) {
            if (value.only) {
                this._only = {};

                (value.only || []).forEach(function(value) {
                    this._only[value] = true;
                }, this);
            }

            this._onlySingleArgument = value.onlySingleArgument;
            this._onlyMultipleArguments = value.onlyMultipleArguments;
        }
    },

    getOptionName: function() {
        return 'disallowSpacesInsideFunctionCalls';
    },

    check: function(file, errors) {
        var only = this._only;
        var onlySingleArgument = this._onlySingleArgument;
        var onlyMultipleArguments = this._onlyMultipleArguments;

        file.iterateNodesByType('CallExpression', function(functionCall) {
            var functionArgs = functionCall.arguments;

            if (onlySingleArgument && functionArgs.length !== 1) {
                return;
            } else if (onlyMultipleArguments && functionArgs.length === 1) {
                return;
            }

            if (functionArgs.length) {
                var firstArg = functionArgs[0];
                var lastArg = functionArgs[functionArgs.length - 1];
                var argFirstToken = file.getTokenByRangeStart(firstArg.range[0]);
                var argLastToken = file.getTokenByRangeEnd(lastArg.range[1]);
                var openParens = file.getPrevToken(argFirstToken);
                var closeParens = file.getNextToken(argLastToken);
                var tokenStart = argFirstToken.value[0];
                var tokenEnd = argLastToken.value[argLastToken.value.length - 1];

                if (only && !(tokenStart in only) && !(tokenEnd in only)) {
                    return;
                }

                errors.assert.noWhitespaceBetween({
                    token: openParens,
                    nextToken: argFirstToken,
                    message: 'Space after opening parenthesis'
                });

                errors.assert.noWhitespaceBetween({
                    token: argLastToken,
                    nextToken: closeParens,
                    message: 'Space before closing parenthesis'
                });
            } else {
                var callToken = file.getTokenByRangeStart(functionCall.range[0]);
                var openParen = file.getNextToken(callToken);
                var closeParen = file.getNextToken(openParen);

                errors.assert.noWhitespaceBetween({
                    token: openParen,
                    nextToken: closeParen,
                    message: 'Space between parentheses'
                });
            }
        });
    }
};
