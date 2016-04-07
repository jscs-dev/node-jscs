/**
 * Disallows commas as last token on a line in lists.
 *
 * Type: `Boolean`, `Object`
 *
 * Values:
 *  - `true` for default behavior (strict mode, comma on the same line)
 *  - `Object`:
 *    - `'allExcept'` array of exceptions:
 *       - `'function'` ignores objects if one of their values is a function expression
 *
 * JSHint: [`laxcomma`](http://www.jshint.com/docs/options/#laxcomma)
 *
 * #### Example
 *
 * ```js
 * "disallowCommaBeforeLineBreak": true
 * ```
 *
 * ##### Valid for `true`
 *
 * ```js
 * var x = {
 *     one: 1
 *     , two: 2
 * };
 * var y = {three: 3, four: 4};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = {
 *     one: 1,
 *     two: 2
 * };
 * ```
 *
 * ##### Valid for `{"allExcept": ["function"]}`
 *
 * ```js
 * var x = {
 *     one: 1,
 *     two: function() {}
 * };
 * ```
 *
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var optionName = this.getOptionName();

        if (typeof options !== 'object') {
            assert(
                options === true,
                optionName + ' option requires either a true value or an object'
            );

            var _options = {allExcept: []};
            return this.configure(_options);
        }

        assert(
            Array.isArray(options.allExcept),
            'Property `allExcept` in ' + optionName + ' should be an array of strings'
        );

        this._exceptFunction = options.allExcept.indexOf('function') > -1;
    },

    getOptionName: function() {
        return 'disallowCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        var exceptFunction = this._exceptFunction;

        function canSkip(token) {
            var node = token.parentElement;
            if (node.getNewlineCount() === 0) {
                return true;
            }

            // exception for function params
            if (
                node.params &&
                file.isOnTheSameLine(node.params[0], node.params[node.params.length - 1])
            ) {
                return true;
            }

            // See #1841
            if (!exceptFunction || !node.properties) {
                return false;
            }

            return node.properties.some(function(property) {
                return property.value.type === 'FunctionExpression';
            });
        }

        file.iterateTokensByTypeAndValue('Punctuator', ',', function(token) {
            var nextToken = token.getNextCodeToken();

            if (canSkip(token) || nextToken.value === ',') {
                return;
            }

            errors.assert.sameLine({
                token: token,
                nextToken: nextToken,
                message: 'Commas should be placed on the same line as value'
            });

            errors.assert.differentLine({
                token: token.getPreviousCodeToken(),
                nextToken: token,
                message: 'Commas should be placed on new line'
            });
        });
    }

};
