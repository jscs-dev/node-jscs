/**
 * Disallows space after opening and before closing function call parentheses.
 *
 * Types: `Boolean` or `Object`
 *
 * Values: Either `true` or Object with `"only"` property as an array of tokens
 *
 * #### Example
 *
 * ```js
 * "disallowSpacesInsideFunctionCallsWithSingleArgument": true
 *
 * // or
 *
 * "disallowSpacesInsideFunctionCallsWithSingleArgument": {
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

        if (isObject) {
            assert('only' in value, error);
        } else {
            assert(value === true, error);
        }

        if (isObject && value.only) {
            this._only = {};

            (value.only || []).forEach(function(value) {
                this._only[value] = true;
            }, this);
        }
    },

    getOptionName: function() {
        return 'disallowSpacesInsideFunctionCallsWithSingleArgument';
    },

    check: function(file, errors) {
        var only = this._only;

        file.iterateNodesByType('CallExpression', function(functionCall) {
            // console.log('found call expression', functionCall);

            // If there's more than one argument, skip.
            if (functionCall.arguments.length > 1) {
                return;
            }

            var firstArg = functionCall.arguments[0];
            var argFirstToken = file.getTokenByRangeStart(firstArg.range[0]);
            var argLastToken = file.getTokenByRangeEnd(firstArg.range[1]);
            var openParens = file.getPrevToken(argFirstToken);
            var closeParens = file.getNextToken(argLastToken);
            var tokenStart = argFirstToken.value[0];
            var tokenEnd = argLastToken.value[argLastToken.value.length];

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
        });
    }
};
