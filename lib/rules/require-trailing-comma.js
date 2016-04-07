/**
 * Requires an extra comma following the final element of an array or object literal.
 *
 * Types: `Boolean` or `Object`
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

/* jshint ignore:start */
// jscs:disable
var assert = require('assert');

var cst = require('cst');
var Token = cst.Token;

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {

        if (typeof options === 'object') {
            if ('ignoreSingleValue' in options) {
                assert(
                    options.ignoreSingleValue === true,
                    this.getOptionName() + ' option ignoreSingleValue requires true value or should be removed'
                );
                this._ignoreSingleValue = true;
            }
            if ('ignoreSingleLine' in options) {
                assert(
                    options.ignoreSingleLine === true,
                    this.getOptionName() + ' option ignoreSingleLine requires true value or should be removed'
                );
                this._ignoreSingleLine = true;
            }
        } else {
            assert(
                options === true,
                this.getOptionName() + ' option requires a true value or should be removed'
            );
        }
    },

    getOptionName: function() {
        return 'requireTrailingComma';
    },

    check: function(file, errors) {
        var _this = this;

        file.iterateNodesByType([
            'ObjectExpression', 'ArrayExpression',
            'ObjectPattern', 'ArrayPattern'
        ], function(node) {
            var isLikeObject = node.type === 'ObjectExpression' || node.type === 'ObjectPattern';
            var entities = isLikeObject ? node.properties : node.elements;

            if (entities.length === 0) {
                return;
            }

            if (_this._ignoreSingleValue && entities.length === 1) {
                return;
            }

            if (_this._ignoreSingleLine && node.getNewlineCount() === 0) {
                return;
            }

            var possibleComma = file.getLastNodeToken(node).getPreviousCodeToken();

            if (possibleComma.value !== ',') {
                errors.cast({
                    message: 'Missing comma before closing ' + (isLikeObject ? 'curly brace' : 'bracket'),
                    element: possibleComma,
                    additional: node
                });
            }
        });
    },

    _fix: function(file, error) {
        var parent = error.additional;
        var afterProp;

        // ArrayPattern/ArrayExpression
        if (parent.type.indexOf('Array') === 0) {
            afterProp = parent.elements[parent.elements.length - 1].lastChild.getNextToken();

        // ObjectExpression/ObjectPattern
        } else {
            afterProp = parent.properties[parent.properties.length - 1].lastChild.getNextToken();
        }

        parent.insertChildBefore(new Token('Punctuator', ','), afterProp);
    }

};
