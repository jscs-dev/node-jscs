/**
 * Disallows commas as last token on a line in lists.
 *
 * Type: `Boolean`|`Object`
 *
 * Values:
 *  - `true` for default behavior (strict mode, comma on the same line)
 *  - `Object`:
 *    - `'lineBreak'` requires a line break between object key and comma
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
 * var y = { three: 3, four: 4};
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
 * ##### Valid for `{"lineBreak": true}`
 *
 * ```js
 * var x = {
 *     one: 1
 *     , two: 2
 * };
 * ```
 *
 * ##### Invalid for `{"lineBreak": true}`
 *
 * ```js
 * var y = { three: 3, four: 4};
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        if (typeof options !== 'object') {
            assert(
                options === true,
                this.getOptionName() + ' option requires either a true value or an object'
            );

            var _options = {allExcept: [], lineBreak: false};
            return this.configure(_options);
        }

        if (Array.isArray(options.allExcept)) {
            this._exceptFunction = options.allExcept.indexOf('function') > -1;
        }
        this._lineBreak = options.lineBreak === true;
    },

    getOptionName: function() {
        return 'disallowCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        var exceptFunction = this._exceptFunction;
        var lineBreak = this._lineBreak;

        function canSkip(token) {
            if (!exceptFunction) {
                return false;
            }
            var node = file.getNodeByRange(token.range[0]);

            if (node.type !== 'ObjectExpression' ||
                node.loc.start.line === node.loc.end.line ||
                node.properties < 2) {
                return false;
            }

            return node.properties.some(function(property) {
                if (exceptFunction && property.value.type === 'FunctionExpression') {
                    return true;
                }
            });

        }

        file.iterateTokensByTypeAndValue('Punctuator', ',', function(token) {
            if (canSkip(token)) {
                return;
            }

            errors.assert.sameLine({
                token: token,
                nextToken: file.getNextToken(token),
                message: 'Commas should be placed on new line'
            });

            if (lineBreak) {
                errors.assert.differentLine({
                    token: file.getPrevToken(token),
                    nextToken: token,
                    message: 'Commas should be placed on new line'
                });
            }
        });
    }

};
