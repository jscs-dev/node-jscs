/**
 * Requires an extra comma following the final element of an array or object literal.
 *
 * Type: `Boolean` or `Object`
 *
 * Values:
 *
 * - `true`: validates all arrays and objects
 * - `Object`:
 *     - `ignoreSingleValue`: allows single property objects and single element arrays to not require a trailing comma
 *     - `ignoreSingleLine`: allows objects and arrays on a single line to not require a trailing comma
 *
 * #### Example
 *
 * ```js
 * "requireTrailingComma": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var foo = [1, 2, 3,];
 * var bar = {a: "a", b: "b",}
 * ```
 *
 * ##### Valid with ignoreSingleValue
 *
 * ```js
 * var car = [1];
 * var dar = {a: "a"};
 * ```
 *
 * ##### Valid with ignoreSingleLine
 *
 * ```js
 * var car = [1, 2, 3];
 * var dar = {a: "a", b: "b"};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var foo = [1, 2, 3];
 * var bar = {a: "a", b: "b"}
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireTrailingComma) {

        if (typeof requireTrailingComma === 'object') {
            if ('ignoreSingleValue' in requireTrailingComma) {
                assert(
                    requireTrailingComma.ignoreSingleValue === true,
                    'requireTrailingComma option ignoreSingleValue requires true value or should be removed'
                );
                this._ignoreSingleValue = true;
            }
            if ('ignoreSingleLine' in requireTrailingComma) {
                assert(
                    requireTrailingComma.ignoreSingleLine === true,
                    'requireTrailingComma option ignoreSingleLine requires true value or should be removed'
                );
                this._ignoreSingleLine = true;
            }
        } else {
            assert(
                requireTrailingComma === true,
                'requireTrailingComma option requires true value or should be removed'
            );
        }
    },

    getOptionName: function() {
        return 'requireTrailingComma';
    },

    check: function(file, errors) {
        var _this = this;

        file.iterateNodesByType(['ObjectExpression', 'ArrayExpression'], function(node) {
            var isObject = node.type === 'ObjectExpression';
            var entities = isObject ? node.properties : node.elements;

            if (entities.length === 0) {
                return;
            }

            if (_this._ignoreSingleValue && entities.length === 1) {
                return;
            }

            if (_this._ignoreSingleLine && node.loc.start.line === node.loc.end.line) {
                return;
            }

            var closingToken = file.getLastNodeToken(node);

            errors.assert.tokenBefore({
                token: closingToken,
                expectedTokenBefore: {type: 'Punctuator', value: ','},
                message: 'Missing comma before closing ' + (isObject ? ' curly brace' : ' bracket')
            });
        });
    }

};
