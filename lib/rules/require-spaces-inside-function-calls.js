/**
 * Requires space after opening and before closing function call parentheses.
 *
 * Types: `Boolean` or `Object`
 *
 * Values:
 * - true
 * - `Object`:
 *      - "except": An array containing tokens to ignore.
 *      - "exceptSingleArgument": true
 *      - "exceptMultipleArguments": true
 *      - "exceptNoArguments": false
 *
 * #### Example
 *
 * ```js
 * "requireSpacesInsideFunctionCalls": true
 *
 * // or
 *
 * "requireSpacesInsideFunctionCalls": {
 *     "except": [ "'", "\'" ]
 * }
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * doSomething( foo );
 * ```
 *
 * ##### Valid for mode `{ except": [ "\'" ] }`
 *
 * ```js
 * doSomething('foo');
 * doSomething( bar );
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * doSomething('foo');
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(value) {
        var isObject = typeof value === 'object';

        var error = this.getOptionName() + ' rule requires string value true or object';

        var validFlags = [
            'except',
            'exceptSingleArgument',
            'exceptMultipleArguments',
            'exceptNoArguments'
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
            if (value.except) {
                this._except = {};

                (value.except || []).forEach(function(value) {
                    this._except[value] = true;
                }, this);
            }

            this._exceptSingleArgument = value.exceptSingleArgument;
            this._exceptMultipleArguments = value.exceptMultipleArguments;
            this._exceptNoArguments = value.exceptNoArguments;
        }

        // By default, don't require spaces inside function calls
        // with no arguments.
        if (this._exceptNoArguments === undefined) {
            this._exceptNoArguments = true;
        }
    },

    getOptionName: function() {
        return 'requireSpacesInsideFunctionCalls';
    },

    check: function(file, errors) {
        var except = this._except;
        var exceptSingleArgument = this._exceptSingleArgument;
        var exceptMultipleArguments = this._exceptMultipleArguments;
        var exceptNoArguments = this._exceptNoArguments;

        file.iterateNodesByType('CallExpression', function(functionCall) {
            var functionArgs = functionCall.arguments;

            if (exceptSingleArgument && functionArgs.length === 1) {
                return;
            }

            if (exceptMultipleArguments && functionArgs.length > 1) {
                return;
            }

            if (exceptNoArguments && functionArgs.length === 0) {
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

                if (except && (tokenStart in except) && (tokenEnd in except)) {
                    return;
                }

                errors.assert.whitespaceBetween({
                    token: openParens,
                    nextToken: argFirstToken,
                    message: 'Space required after opening parenthesis'
                });

                errors.assert.whitespaceBetween({
                    token: argLastToken,
                    nextToken: closeParens,
                    message: 'Space required before closing parenthesis'
                });
            } else if (!exceptNoArguments) {
                var callToken = file.getTokenByRangeStart(functionCall.range[0]);
                var openParen = file.getNextToken(callToken);
                var closeParen = file.getNextToken(openParen);

                errors.assert.whitespaceBetween({
                    token: openParen,
                    nextToken: closeParen,
                    message: 'Space required between parentheses'
                });
            }
        });
    }
};
