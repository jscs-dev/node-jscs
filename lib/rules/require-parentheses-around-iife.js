/**
 * Requires parentheses around immediately invoked function expressions.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [`immed`](http://www.jshint.com/docs/options/#immed)
 *
 * #### Example
 *
 * ```js
 * "requireParenthesesAroundIIFE": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = (function(){ return 1; })();
 * var b = (function(){ return 2; }());
 * var c = (function(){ return 3; }).call(this, arg1);
 * var d = (function(){ return 3; }.call(this, arg1));
 * var e = (function(){ return d; }).apply(this, args);
 * var f = (function(){ return d; }.apply(this, args));
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = function(){ return 1; }();
 * var c = function(){ return 3; }.call(this, arg1);
 * var d = function(){ return d; }.apply(this, args);
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireParenthesesAroundIIFE) {
        assert(
            typeof requireParenthesesAroundIIFE === 'boolean',
            'requireParenthesesAroundIIFE option requires boolean value'
        );
        assert(
            requireParenthesesAroundIIFE === true,
            'requireParenthesesAroundIIFE option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireParenthesesAroundIIFE';
    },

    check: function(file, errors) {

        function isWrapped(node) {
            var tokens = file.getTokens();
            var openingToken = file.getTokenPosByRangeStart(node.range[0]);
            var closingToken = file.getTokenPosByRangeStart(node.range[1] - 1);

            return tokens[openingToken - 1].value + tokens[closingToken + 1].value === '()';
        }

        file.iterateNodesByType('CallExpression', function(node) {
            var callee = node.callee;
            var outer = node;
            var inner;

            if (callee.type === 'MemberExpression' &&
                callee.object.type === 'FunctionExpression' &&
                callee.property.type === 'Identifier' &&
                (callee.property.name === 'call' || callee.property.name === 'apply')
            ) {
                inner = callee.object;
            } else if (callee.type === 'FunctionExpression') {
                inner = callee;
            } else {
                return;
            }

            if (!isWrapped(inner) && !isWrapped(outer)) {
                errors.add(
                    'Wrap immediately invoked function expressions in parentheses',
                    node.loc.start.line,
                    node.loc.start.column
                );

            }
        });
    }

};
