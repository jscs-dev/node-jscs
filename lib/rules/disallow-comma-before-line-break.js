/**
 * Disallows commas as last token on a line in lists.
 *
 * Type: `Boolean`|`Object`
 *
 * Values:
 *  - `true` for default behavior (strict mode, comma on the same line)
 *  - `"mode"` options:
 *    - `"all"` for strict mode
 *    - `"ignoreFunction"` ignores objects if one of the property values is a function expression
 *  - `"lineBreak"` options:
 *    - `"none"` comma can be on the same line with both operands
 *    - `"beforeComma"` comma must have a line break after it's first operand
 *
 * JSHint: [`laxcomma`](http://www.jshint.com/docs/options/#laxcomma)
 *
 * #### Example
 *
 * ```js
 * "disallowCommaBeforeLineBreak": true
 * ```
 *
 * ##### Valid
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
 * ```js
 * "disallowCommaBeforeLineBreak": {
 *     "lineBreak": "beforeComma"
 * }
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var x = {
 *     one: 1
 *     , two: 2
 * };
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var y = { three: 3, four: 4};
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var modes = {
            'all': 'all',
            'ignoreFunction': 'ignoreFunction'
        };
        var lineBreaks = {
            'none': 'none',
            'beforeComma': 'beforeComma'
        };
        assert(
            options === true || typeof options === 'object',
            this.getOptionName() + ' option requires either a true value or an object'
        );
        if (typeof options === 'object') {
            assert(
                !options.mode || modes[options.mode],
                this.getOptionName() + ' option\'s parameter mode must be one of' +
                    Object.keys(modes).join(', ')
            );

            assert(
                !options.lineBreak || lineBreaks[options.lineBreak],
                this.getOptionName() + ' option\'s parameter lineBreaks must be one of' +
                    Object.keys(lineBreaks).join(', ')
            );
        } else {
            options = {};
        }
        this._mode = modes[options.mode] || modes.all;
        this._lineBreak = lineBreaks[options.lineBreak] || lineBreaks.none;
    },

    getOptionName: function() {
        return 'disallowCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        var mode = this._mode;
        var lineBreak = this._lineBreak;

        function canSkip(token) {
            if (mode === 'all') {
                return false;
            }
            var node = file.getNodeByRange(token.range[0]);

            if (node.type !== 'ObjectExpression' ||
                node.loc.start.line === node.loc.end.line ||
                node.properties < 2) {
                return false;
            }

            return node.properties.some(function(property) {
                if (mode === 'ignoreFunction' && property.value.type === 'FunctionExpression') {
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

            if (lineBreak === 'beforeComma') {
                errors.assert.differentLine({
                    token: file.getPrevToken(token),
                    nextToken: token,
                    message: 'Commas should be placed on new line'
                });
            }
        });
    }

};
